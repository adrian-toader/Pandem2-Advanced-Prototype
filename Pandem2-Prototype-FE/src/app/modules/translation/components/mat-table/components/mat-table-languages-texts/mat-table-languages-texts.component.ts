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
import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableButtonAction, TableColumn } from 'src/app/core/models/translation';
import { MatDialogComponent } from '../mat-dialog/mat-dialog.component';
import { TranslationDataService } from 'src/app/core/services/data/translation.data.service';
import { HoverRowAction } from 'src/app/shared/components';


@Component({
  selector: 'app-mat-table-languages-texts',
  templateUrl: './mat-table-languages-texts.component.html',
  styleUrls: ['./mat-table-languages-texts.component.less']
})
export class MatTableLanguagesTextsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() action: EventEmitter<TableButtonAction> = new EventEmitter<TableButtonAction>();
  columns: Array<TableColumn> = [
    { columnDef: 'key', header: 'KEY' },
    { columnDef: 'base_value', header: 'BASE VALUE' },
    { columnDef: 'value', header: 'VALUE' }
  ];
  @Input() dataset: Array<any> = [];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  value: string;
  dialogRef: any;
  countriesList;
  selectedBaseCulture: string;
  selectedTargetCulture: string;
  pageSize: number = 10;
  currentPageIndex: number = 0;
  targetCultureId: string;
  recordActions: HoverRowAction[] = [
    // View User
    new HoverRowAction({
      icon: 'settings',
      iconTooltip: 'Edit language',
      click: (e) => {
        this.onTableAction(e, this.dataSource.filteredData.indexOf(e));
      }
    })
  ];

  constructor(public dialog: MatDialog, private translationDataService: TranslationDataService) { }

  ngOnInit() {
    this.translationDataService.retrieveLanguagesList().subscribe((data) => {
      this.countriesList = data;
      this.selectedBaseCulture = data?.[0]?.country_code;
      this.selectedTargetCulture = data?.[0]?.country_code;
      this.targetCultureId = data?.[0]?._id;
      this.dataSource = new MatTableDataSource<any>(this.combineTranslations(data?.[0]?.translations, data?.[0]?.translations));
      // set table columns
      this.displayedColumns = this.displayedColumns.concat(this.columns.map(x => x.columnDef));    // pre-fix static

      // set pagination
      this.dataSource.paginator = this.paginator;

    });

  }

  onTableAction(item, index): void {
    this.dialogRef = this.dialog.open(MatDialogComponent, {
      autoFocus: false,
      restoreFocus: false,
      data: {
        item,
        selectedTargetCulture: this.selectedTargetCulture,
        index,
        dataSource: this.dataSource,
        parent: this
      }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() === true) {
      return this.selection.clear();
    } else {
      return this.dataSource.data.forEach(row => this.selection.select(row));
    }

  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onBaseCultureChange(event: any) {
    this.selectedBaseCulture = event.value;
    const baseCultureValue = this.countriesList.filter(item => item.country_code === event.value);
    const targetCultureValue = this.countriesList.filter(item => item.country_code === this.selectedTargetCulture);
    this.dataSource = new MatTableDataSource(this.combineTranslations(baseCultureValue[0].translations, targetCultureValue[0].translations));
    this.dataSource.paginator = this.paginator;
  }
  onTargetCultureChange(event: any) {
    this.selectedTargetCulture = event.value;
    const targetCultureValue = this.countriesList.filter(item => item.country_code === event.value);
    const baseCultureValue = this.countriesList.filter(item => item.country_code === this.selectedBaseCulture);
    this.dataSource = new MatTableDataSource(this.combineTranslations(baseCultureValue[0].translations, targetCultureValue[0].translations));
    this.targetCultureId = targetCultureValue[0]._id;
    this.dataSource.paginator = this.paginator;
  }

  /**
 * Combine translations from two language datasets into an array of objects.
 * Each object contains the key, base value, and translated value.
 */
  combineTranslations(baseData, translatedData) {
    const result = [];

    const traverse = (baseObj, translatedObj, prefix = '') => {
      for (const key in baseObj) {
        if (typeof baseObj[key] === 'string') {
          const translationKey = prefix ? `${prefix}.${key}` : key;
          const baseValue = baseObj[key];
          const translatedValue = translatedObj[key];
          result.push({
            key: translationKey,
            baseValue: baseValue,
            value: translatedValue
          });
        } else if (typeof baseObj[key] === 'object') {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          traverse(baseObj[key], translatedObj[key], newPrefix);
        }
      }
    };

    traverse(baseData, translatedData);
    return result;
  }
  onPageSizeChange(event) {
    this.pageSize = event.pageSize;
  }
}
