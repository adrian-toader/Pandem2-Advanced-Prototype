/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { readdir } from 'fs/promises';
import Fs from 'fs';
import { App } from '../../app';
import { DataType, IImportResult, ImportResultModel, Status, statusMap } from '../../models/importResult';
import {
  ImportResultFileModel,
  IImportResultFile,
  ResultFileStatusImported,
  ResultFileStatusFailed
} from '../../models/importResultFile';
import { pool } from 'workerpool';
import * as Path from 'path';
import * as Async from 'async';
import Moment from 'moment';
import { NUTSModel } from '../../models/nuts';
import * as os from 'os';
import ExcelJS from 'exceljs';
import { CaseModel, ICase } from '../../models/case';
import { ILocationEntry } from '../../components/nuts/helpers';
import { AnyObject } from '../../server/interfaces/helpers';
import { FastifyLoggerInstance } from 'fastify';

export class ImportManager {
  private path: string;
  private dataType: DataType[];
  private importResult?: IImportResult;
  private log: FastifyLoggerInstance | any;

  constructor(path: string | IImportResult, dataType?: DataType[], log?: FastifyLoggerInstance) {
    if (typeof path === 'string') {
      this.path = path;
      if (!dataType) {
        throw new Error('Datatype is required');
      }

      this.dataType = dataType;
    } else {
      // path is actually an import result
      this.importResult = path;
      this.path = this.importResult.path!;
      this.dataType = this.importResult.data_type;
    }

    if (log) {
      this.log = log;
    }

    // check if the provided path actually exists and is a directory
    if (!Fs.existsSync(this.path)) {
      throw App.errorsHelper.getError('INVALID_IMPORT_PATH');
    }
  }

  /**
   * Import files in parallel using workers
   * @param importResult
   * @param files
   * @private
   */
  private async importFiles(importResult: IImportResult, files: string[]) {
    // import files in order if they have reporting periods
    let filesInOrder: string[] = files;
    if (/^.*reporting_period-\d{4}-\d{2}-\d{2}.*\.json$/.test(files[0])) {
      filesInOrder = files.sort((file1, file2) => {
        const regexResultsFile1 = /^.*reporting_period-(\d{4}-\d{2}-\d{2}).*\.json$/.exec(file1);
        const regexResultsFile2 = /^.*reporting_period-(\d{4}-\d{2}-\d{2}).*\.json$/.exec(file2);
        const dateFile1 = Moment.utc(regexResultsFile1 ? regexResultsFile1[1] : new Date());
        const dateFile2 = Moment.utc(regexResultsFile2 ? regexResultsFile2[1] : new Date());

        return dateFile1.isSame(dateFile2) ? 0 :
          dateFile1.isBefore(dateFile2) ? -1 : 1;
      });
    }

    // date from where to start the import
    const startDate = importResult.last_file_date;

    const cpusNo = (os.cpus().length - 1) || 1;
    const maxCpuNo = cpusNo > 5 ? 5 : cpusNo;
    const parallelWorkers = filesInOrder.length > maxCpuNo ? maxCpuNo : filesInOrder.length;
    const workerPool = pool(Path.resolve(__dirname, './FileProcessor.js'), {
      minWorkers: 'max',
      maxWorkers: parallelWorkers,
      // // @ts-ignore
      // onCreateWorker: (options) => {
      //   console.log(options);
      //   return {
      //     forkOpts: {
      //       execArgv: [`--inspect-brk=${Math.floor(Math.random() * 50000) + 10000}`]
      //     }
      //   };
      // }
    });

    // get all nuts to have them available for file processing
    const nuts = await NUTSModel
      .find({}, {
        code: 1,
        level: 1
      }, {
        lean: true
      });

    const inProgress = new Set();
    const execFile = async (file: string, coreNumber: number): Promise<any> => {
      // get file date and check if it needs to be parsed; we might be in a resume import action
      const regexResultsFile = /^.*reporting_period-(\d{4}-\d{2}-\d{2}).*\.json$/.exec(file);
      if (regexResultsFile) {
        const fileDate = new Date(regexResultsFile[1]);
        if (
          // we are resuming an import
          startDate &&
          (
            // file date is older than last date parsed
            Moment(startDate).isAfter(fileDate) ||
            // file date is same and is the same file
            Moment(startDate).isSame(fileDate) &&
            importResult.last_file === file
          )
        ) {
          // skip file as it was already parsed
          return execFile(filesInOrder.shift()!, coreNumber);
        }
      }

      // start processing file
      inProgress.add(file);

      // create result file record
      const importResultFile: IImportResultFile = {
        importResultId: importResult._id.toString(),
        file_name: file,
        status: ResultFileStatusImported,
        core_number: coreNumber
      };

      try {
        App.logger.debug({
          id: importResult._id.toString(),
          file
        }, 'Import: Importing file');
        importResultFile.results = await workerPool.exec('importDataFromFile', [{
          file: Path.resolve(this.path, file),
          dataType: this.dataType,
          config: App.serviceConfig,
          nuts
        }]);
      } catch (err: any) {
        App.logger.debug({
          id: importResult._id.toString(),
          file,
          err: err instanceof Error ? err : (err.toString() || JSON.stringify(err))
        }, 'Import: Error importing file');

        importResultFile.status = ResultFileStatusFailed;
        importResultFile.error = err;
      }

      // save result file
      await ImportResultFileModel.create(importResultFile);

      // get new file
      inProgress.delete(file);
      const newFile = filesInOrder.shift();
      if (newFile) {
        return execFile(newFile, coreNumber);
      } else if (inProgress.size === 0) {
        // no new file and no other file is in processing
        // last worker done
        workerPool.terminate();

        importResult.status = statusMap.success as Status;
        importResult.end_date = new Date();

        await importResult
          .save()
          .catch(err => {
            App.logger.debug({
              id: importResult._id.toString(),
              status: importResult.status,
              err: err instanceof Error ? err : JSON.stringify(err)
            }, 'Import: Error saving import status on done');
          });
      }
    };

    const parallelWorkersPromises = [];
    for (let i = 1; i <= parallelWorkers; i++) {
      const file = filesInOrder.shift();
      parallelWorkersPromises.push(async (callback: () => void) => {
        try {
          await execFile(file!, i);
        } catch (err) {
          App.logger.debug({
            id: importResult._id.toString(),
            err: err instanceof Error ? err : JSON.stringify(err)
          }, 'Import: Error processing files');
        }
        callback();
      });
    }

    try {
      await Async.parallel(parallelWorkersPromises);
    } catch (err) {
      App.logger.debug({
        id: importResult._id.toString(),
        err: err instanceof Error ? err : JSON.stringify(err)
      }, 'Import: Error processing files in parallel');
    }
  }

  public async execute(): Promise<IImportResult> {
    // get a list with all the files from this path
    let files;
    if (Fs.statSync(this.path).isDirectory()) {
      files = await readdir(this.path);
    } else {
      files = [this.path];
    }

    const importResult = this.importResult ?
      this.importResult :
      await ImportResultModel
        .create({
          data_type: this.dataType,
          path: this.path,
          no_files: files.length,
          start_date: new Date(),
          status: statusMap.inProgress
        });

    // run the import asynchronously
    this.importFiles(importResult, files)
      .then(() => {
        App.logger.debug({
          id: importResult._id.toString(),
          status: importResult.status
        }, 'Import: Import finalized');
      })
      .catch(err => {
        App.logger.error({
          id: importResult._id.toString(),
          err: err.toString() || JSON.stringify(err)
        }, 'Import: Error on import');
      });

    return importResult;
  }

  /**
   * Import data from xlsx file:
   *  - define a mapping object used for identifying sheet data, 
   *  - open a xlsx stream using ExcelJS,
   *  - iterate the xlsx sheets and import data,
   *  - delete the temporary file used,
   *  - update import details. 
   */
  public async importDataFromXlsxFile() {
    const mappings: any = {
      Hospitalised_deaths: {
        addList: [],
        delList: [],
        dayTotals: [],
        header: {
          row: null,
          columns: [
            { name: 'Date', aliases: ['Date'], required: true },
            { name: 'Country' },
            { name: 'nuts2/3' },
            { name: 'Population' },
            { name: 'Gender' },
            { name: 'Age group' },
            { name: 'Number of patients Hospitalized with COVID' },
            { name: 'Number of patients in ICU with COVID' },
            { name: 'Number of patients in LTCF with COVID' },
            { name: 'Number of deaths with COVID' },
            { name: 'Number of deaths for COVID hospitalised' },
            { name: 'Number of deaths for COVID in ICU' },
            { name: 'Number of patients Hospitalized' },
            { name: 'Average Length of Stay' },
            { name: 'Number of patients in ICU' },
            { name: 'Average Length of Stay at ICU' },
            { name: 'Number of deaths' },
            { name: 'Number of patients with COVID in LTCF' },
            { name: 'Number of deaths in LCTF' },
            { name: 'Standarise mortality by age' },
            { name: 'Standarise mortality by age for COVID' },
            { name: 'Excess mortality' },
            { name: 'Excess mortality LTCF' }
          ],
          colIndex: {}
        },
        Date: [
          'date'
        ]
      },
      Vaccination: {
        addList: [],
        delList: [],
        dayTotals: [],
        header: {
          row: null,
          columns: [
            { name: 'Date', required: true },
            { name: 'Level_NUTS2/3/country', aliases: ['NUTS2/3/country'], required: false },
            { name: 'ID_NUTS2/3/country', aliases: ['NUTS2/3/country'], required: false },
            { name: 'Age group', required: true },
            { name: 'Population', required: true },
            { name: 'Vaccinated individuals with 1 dose', required: true },
            { name: 'Vaccinated individuals with 2 dose', required: true },
            { name: 'Vaccinated individuals with 3 dose', required: true }
          ],
          colIndex: {}
        }
      },
      Testing: {
        addList: [],
        delList: [],
        dayTotals: [],
        header: {
          row: null,
          columns: [
            { name: 'Level (NUTS2/3/country)', required: false },
            { name: 'NUTS2/3/country', required: false },
            { name: 'Date', required: true },
            { name: 'Positive results', required: true },
            { name: 'number of test performed', required: true },
            { name: 'Test Type (active cases)', required: true },
            { name: 'Num of available tests', required: true },
            { name: 'Negative results', required: true },
            { name: 'Inconclusive results', required: true },
            { name: 'Unknown results', required: true }
          ],
          colIndex: {}
        }
      },
      Cases: {
        addList: [],
        delList: [],
        dayTotals: [],
        header: {
          row: null,
          columns: [
            { name: 'Date', aliases: ['The date (example)'], required: true },
            { name: 'NUTS2/3/country', required: true },
            { name: 'Gender', required: true },
            { name: 'Age group', required: true },
            { name: 'Confirmed cases', required: true },
            { name: 'Population', required: false },
            { name: 'Active cases', required: true },
            { name: 'Recovered Cases', required: true },
            { name: 'Rt', required: true },
            { name: 'Effective Growth Potential', required: true },
            { name: 'Possible cases', required: true },
            { name: 'Probable cases', required: true },
            { name: 'Imported cases', required: true },
            { name: 'Cases in HCW', required: false },
            { name: 'Reinfections cases', required: true },
            { name: 'Number of alerts of potential cases in humans', required: true },
            { name: 'Number of alerts cases of potential cases in animals', required: true }
          ],
          colIndex: {
            date: -1,
            location: -1,
            gender: -1,
            confirmed: -1,
            active: -1,
            recovered: -1,
            possible: -1,
            probable: -1,
            ageGroup: -1
          }
        }
      }
    };

    const wbReader: any = new ExcelJS.stream.xlsx.WorkbookReader(this.importResult!.path!, {
      sharedStrings: 'cache'
    });

    for await (const worksheet of wbReader) {
      if (!Object.keys(mappings).includes(worksheet.name))
        continue;

      if (worksheet.name === 'Cases') {
        this.importCasesFromXlsxSheet(worksheet, mappings);
      }
    }
    
    // remove the file
    Fs.unlinkSync(this.importResult!.path!);

    // update import 
    this.importResult!.status = statusMap.success as Status;
    this.importResult!.end_date = Moment().toDate();

    await ImportResultModel.findByIdAndUpdate(this.importResult!._id, this.importResult!);
  }

  /**
   * Import cases from xlsx sheet:
   *  - iterate the lines,
   *  - find the header row (using the mappings object), and for the rows below the header:
   *  - map row to a case items list,
   *  - delete the case items with the same parameters from DB,
   *  - save the case items in 100 batches to DB,
   *  - compute and save the day totals.
   * @param worksheet 
   * @param mappings 
   */
  private async importCasesFromXlsxSheet(worksheet: any, mappings: any) {
    for await (const row of worksheet) {
      if (!mappings.Cases.header.row && this.isHeaderRow(row, worksheet.name, mappings)) {
        mappings.Cases.header.row = row;

        // cases - map header
        mappings.Cases.header.colIndex = {
          date: this.getColIndexByName(mappings.Cases.header.row, 'Date'),
          location: this.getColIndexByName(mappings.Cases.header.row, 'NUTS2/3/country'),
          gender: this.getColIndexByName(mappings.Cases.header.row, 'Gender'),
          confirmed: this.getColIndexByName(mappings.Cases.header.row, 'Confirmed cases'),
          active: this.getColIndexByName(mappings.Cases.header.row, 'Active cases'),
          recovered: this.getColIndexByName(mappings.Cases.header.row, 'Recovered cases'),
          possible: this.getColIndexByName(mappings.Cases.header.row, 'Possible cases'),
          probable: this.getColIndexByName(mappings.Cases.header.row, 'Probable cases'),
          reproductionNumber: this.getColIndexByName(mappings.Cases.header.row, 'Rt'),
          ageGroup: this.getColIndexByName(mappings.Cases.header.row, 'Age group')
        };
      } else if (mappings.Cases.header.row && row.number > mappings.Cases.header.row.number) {
        if (!row.hasValues) {
          continue;
        }

        // one sheet row can produce zero, one or more items: 
        // confirmed, active, recovered ...   
        const items: ICase[] = await this.rowToCases(row, mappings.Cases.header.colIndex, this.importResult!);
        if (!items.length) {
          continue;
        }

        mappings.Cases.addList.push(...items);

        this.updateCasesDelList(mappings.Cases.delList, items);
        this.updateCasesDayTotals(mappings.Cases.dayTotals, items);

        // save to DB
        if (mappings.Cases.addList.length >= 100) {
          // delete before save
          await this.deleteCases(mappings.Cases.delList);
          await this.saveCases(mappings.Cases.addList);

          mappings.Cases.delList = [];
          mappings.Cases.addList = [];
        }
      }
    }

    // check if save, delete or day totals arrays still contain items
    await this.deleteCases(mappings.Cases.delList);

    // save, save day totals
    await this.saveCases(mappings.Cases.addList);
    await this.saveCases(mappings.Cases.dayTotals);
  }

  /**
   * Check if a sheet row it's the header row using the mapping object,
   * each sheet is represented in the mapping object by a key [sheetName],  
   * [sheetName]/header/columns contains the list of header columns 
   * mapping definition, each column will have name, (possible) aliases and 
   * required property. If a row contains all the required cells, (name or one of
   * the aliases), then it will be considered the header row 
   * @param row - row to check
   * @param worksheetName - the name of the sheet
   * @param mappings - the mapping object used to determine the header row
   * @returns 
   */
  private isHeaderRow(row: any, worksheetName: string, mappings: any): boolean {
    let result = false;

    const requiredHeaderCells = mappings[worksheetName].header.columns.filter((p: any) => p.required);
    if (!requiredHeaderCells.length) {
      // import excel data: worksheet mapping should contain at least one required column
      return result;
    }

    let requiredFound = 0;
    for (const cell of row._cells) {
      const isHeaderCell = cell && cell.value && this.rowContainCellWithValue(requiredHeaderCells, cell);
      if (isHeaderCell) {
        requiredFound++;
        result = requiredFound === requiredHeaderCells.length;
        if (result) {
          break;
        }
      }
    }

    return result;
  }

  /**
   * Check if a sheet row cell is contained in the mappings required cells list
   * @param requiredHeaderCells
   * @param cell
   * @returns 
   */
  private rowContainCellWithValue = (requiredHeaderCells: any, cell: any): boolean => {
    const item = requiredHeaderCells.find((p: any) => {
      const tlvalue = cell.value.trim().toLowerCase(); // trimmed and lowered-case value
      if (p.name.trim().toLowerCase() === tlvalue)
        return true;

      if (p.aliases) {
        const aliases = p.aliases.map((alias: any) => alias.trim().toLowerCase());
        if (aliases.includes(tlvalue))
          return true;
      }

      return false;
    });

    return !!item;
  };

  /**
   * Take the sheet row and return one or many case items
   * @param row 
   * @param headerMappings 
   * @returns 
   */
  private async rowToCases(row: any, headerMappings: any, importItem: any): Promise<ICase[]> {
    const date: Date = this.getCellValueByIndex(row, headerMappings.date, 'date');

    const locationCode = this.getCellValueByIndex(row, headerMappings.location);
    const gender = this.getCellValueByIndex(row, headerMappings.gender);
    const ageGroup = this.getCellValueByIndex(row, headerMappings.ageGroup);

    const confirmed = this.getCellValueByIndex(row, headerMappings.confirmed, 'number');
    const active = this.getCellValueByIndex(row, headerMappings.active, 'number');
    const recovered = this.getCellValueByIndex(row, headerMappings.recovered, 'number');
    const possible = this.getCellValueByIndex(row, headerMappings.possible, 'number');
    const probable = this.getCellValueByIndex(row, headerMappings.probable, 'number');
    const reproductionNumber = this.getCellValueByIndex(row, headerMappings.reproductionNumber, 'number');

    const cases: ICase[] = [];

    // validate values
    if (!confirmed && !active && !recovered && !possible && !probable && !reproductionNumber)
      return cases; // nothing to add

    if (!date) {
      // date value missing
      return cases;
    }

    // TO DO - add all fields check

    const location = await NUTSModel.findOne({
      code: locationCode
    }, null, {
      lean: true
    }) as ILocationEntry;

    const newCase: ICase = {
      pathogenId: importItem.pathogen,
      date: date,
      subcategory: 'Confirmed',
      gender: gender,
      age_group: ageGroup,
      total_type: 'Absolute',
      total: 0,
      is_date_total: false,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      import_metadata: {
        importId: importItem._id.toString()
      }
    };

    if (confirmed) {
      newCase.subcategory = 'Confirmed';
      newCase.total = confirmed;
      cases.push(newCase);
    }

    if (active) {
      newCase.subcategory = 'Active';
      newCase.total = active;
      cases.push(newCase);
    }

    if (recovered) {
      newCase.subcategory = 'Recovered';
      newCase.total = recovered;
      cases.push(newCase);
    }

    if (reproductionNumber) {
      newCase.subcategory = 'Reproduction Number';
      newCase.total = reproductionNumber;
      cases.push(newCase);
    }

    return cases;
  }

  /**
   * Return cell value using the index of the cell
   * @param row 
   * @param index
   * @param type
   * @param dateFormat
   */
  private getCellValueByIndex(row: any, index: number, type = 'string') {
    let result: any;
    const cell = row._cells[index];
    if (!cell || !cell.value || index === -1)
      return result;

    if (type === 'date') {
      // cell value can contain various date formats
      const fmts = ['DD/MM/YYYY', 'MM/DD/YYYY'];
      for (const fmt of fmts) {
        let mm: any;
        try {
          mm = Moment(cell.value, fmt);
        } catch (err: any) {
          this.log.error({ err }, 'Failed to parse date');
        }

        if (mm.isValid()) {
          result = mm.toDate();
          break;
        }
      }
    } else if (type === 'number') {
      try {
        result = Number(cell.value);
      } catch (err: any) {
        this.log.error({ err }, 'Failed to parse number');
      }

    } else if (type === 'string') {
      result = cell.value;
    }

    return result;
  }

  /**
   * Get the index of the column with cell text
   * @param row 
   * @param columnText 
   * @returns column index or -1
   */
  private getColIndexByName(row: any, columnText: string) {
    const cell = row._cells.find((p: any) => {
      if (p && p.value && p.value.trim().toLowerCase() === columnText.trim().toLowerCase()) {
        return true;
      }
      return false;
    });
    return cell && (cell.col - 1);
  }

  /** 
   * Update cases delete and dayTotals lists
   * @param delList
   * @param casesList
  */
  private async updateCasesDelList(delList: any, casesList: any) {
    if (!casesList.length) return;
    for (const item of casesList) {
      const delItem = delList.find((p: any) => this.sameCase(p, item));
      if (!delItem) {
        delList.push(item);
      }
    }
  }

  /**
   * Update cases day totals
   * @param dayTotals
   * @param casesList
   */
  private updateCasesDayTotals(dayTotals: any, casesList: any) {
    if (!casesList.length) return;
    for (const item of casesList) {
      const dayTotalItem = dayTotals.find((p: any) => this.sameCase(p, item));

      if (!dayTotalItem) {
        item.is_date_total = true;
        dayTotals.push(item);
      } else {
        dayTotalItem.total += item.total;
      }
    }
  }

  /**
   * Check if two cases have the same properties
   */
  private sameCase(a: any, b: any) {
    const dateFormat = 'DD/MM/YYYY';
    if (
      a.subcategory === b.subcategory &&
      a.total_type === b.total_type &&
      a.locationCode === b.location.code &&
      Moment(a.date, dateFormat).isSame(Moment(b.date, dateFormat)) &&
      a.importId === b.importId
    )
      return true;

    return false;
  }

  /**
   * Delete a list of cases, 
   * the cases with the same location, subcategory, total_type, day 
   * but with different importId (another import) will be deleted
   * @param casesList
   */
  private async deleteCases(list: any) {
    if (!list.length) {
      return;
    }

    const deleteConditions: AnyObject[] = [];
    for (const item of list) {
      deleteConditions.push({
        'location.value': item.location.code,
        subcategory: item.subcategory,
        total_type: item.totalType,
        date: new Date(Moment(item.date, 'DD/MM/YYYY').format('YYYY-MM-DD')),
        importId: {
          '$ne': item.importId
        }
      });
    }

    await CaseModel.deleteMany({
      '$or': deleteConditions
    });
  }

  /**
   * Save a list of cases (or cases day totals) 
   * if the list contain items
   * @param list 
   */
  private async saveCases(list: ICase[]) {
    if (!list.length) {
      return;
    }

    await CaseModel.create(list);
  }
}
