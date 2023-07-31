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
import { worker } from 'workerpool';
import { DataType } from '../../models/importResult';
import { getConnection } from '../../server/core/database/mongodbConnection';
import { IConfig } from '../../server/interfaces/config';
import { CasesFileImport } from './data/CasesFileImport';
import { readJSONSync } from 'fs-extra';
import { INUTS } from '../../models/nuts';
import { PatientsFileImport } from './data/PatientsFileImport';
import { DeathsFileImport } from './data/DeathsFileImport';

// cache mongodb connection
let connection: any;

const importDataFromFile = async (options: { file: string, dataType: DataType, config: IConfig, nuts?: INUTS[] }) => {
  // open connection to MongoDB
  if (!connection) {
    connection = await getConnection(options.config.mongodb);
  }
  // get data from file
  const data = readJSONSync(options.file);
  switch (options.dataType) {
    case 'case': {
      const importer = new CasesFileImport(data, options.nuts!);
      return importer.importData();
    }
    case 'patient': {
      const importer = new PatientsFileImport(data, options.nuts!);
      return importer.importData();
    }
    case 'death': {
      const importer = new DeathsFileImport(data, options.nuts!);
      return importer.importData();
    }
  }
};

worker({
  importDataFromFile
});
