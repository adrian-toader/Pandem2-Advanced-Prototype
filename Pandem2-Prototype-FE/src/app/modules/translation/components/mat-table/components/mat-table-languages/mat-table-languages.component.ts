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
import { Component, EventEmitter, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableButtonAction, TableColumn } from 'src/app/core/models/translation';
import { TranslationDataService } from 'src/app/core/services/data/translation.data.service';
import { MatDialogCreateLanguageComponent } from '../mat-dialog-create-language/mat-dialog-create-language.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HoverRowAction } from 'src/app/shared/components';
import { ApiQueryBuilder } from 'src/app/core/helperClasses/api-query-builder';
import { ListPagePaginator } from 'src/app/core/helperClasses/list/list-page-paginator';
import { MetadataModel } from 'src/app/core/models/base/metadata.model';

@Component({
  selector: 'app-mat-table-languages',
  templateUrl: './mat-table-languages.component.html',
  styleUrls: ['./mat-table-languages.component.less']
})
export class MatTableLanguagesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() action: EventEmitter<TableButtonAction> = new EventEmitter<TableButtonAction>();
  columns: Array<TableColumn> = [
    { columnDef: 'display_name', header: 'DISPLAY NAME' },
    { columnDef: 'prefix', header: 'PREFIX' },
    { columnDef: 'enabled', header: 'ENABLED' },
    { columnDef: 'default', header: 'DEFAULT LANGUAGE' }
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  value: string;
  dialogRef: any;
  dialog_data: any;
  query = new ApiQueryBuilder();
  queryPaginator = new ListPagePaginator();
  pageIndex;
  pageSize;
  recordActions: HoverRowAction[] = [
    // View User
    new HoverRowAction({
      icon: 'settings',
      iconTooltip: 'Edit language',
      click: (e) => {
        this.dialogRef = this.dialog.open(MatDialogCreateLanguageComponent, {
          autoFocus: false,
          restoreFocus: false,
          data: {
            language: e,
            editDialog: true,
            parent: this
          }
        });
      }
    }),
    new HoverRowAction({
      icon: 'delete',
      iconTooltip: 'Delete language',
      click: (e) => {
        this.deleteLanguage(e._id);
      }
    }),
    new HoverRowAction({
      icon: 'language',
      iconTooltip: 'Make language default',
      click: (e) => {
        this.setDefaultLanguage(e._id);
      }
    }),
    new HoverRowAction({
      icon: 'cloud_download',
      iconTooltip: 'Download translation',
      click: (e) => {
        const jsonStr = JSON.stringify(e.translations, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        link.download = `${e.display_name.toLowerCase()}.json`;

        // Simulate a click event to trigger the download
        link.click();

        // Clean up the URL object
        window.URL.revokeObjectURL(url);
      }
    }),
    new HoverRowAction({
      icon: 'cloud_upload',
      iconTooltip: 'Upload translation',
      click: (data) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';

        fileInput.addEventListener('change', (event: any) => {
          const file = event.target.files[0];
          // Create a FormData object and append the file to it
          const formData = new FormData();
          formData.append('file', file);
          this.translationDataService.uploadTranslationFile(data._id, formData).subscribe((response) => {
            if (response.status === 204) {
              this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.TRANSLATION.UPLOAD));
            }
          });

        });

        fileInput.click();
      }
    })

  ];

  constructor(private translationDataService: TranslationDataService, public dialog: MatDialog,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    // add action column
    this.translationDataService.retrieveLanguagesList().subscribe((data) => {
      this.dataSource = new MatTableDataSource<any>(data);
      // set table columns
      this.displayedColumns = this.displayedColumns.concat(this.columns.map(x => x.columnDef));    // pre-fix static

      // set pagination
      this.dataSource.paginator = this.paginator;
    });
  }

  onTableAction(e: TableButtonAction): void {
    if (e.name === 'delete') {
      this.deleteLanguage(e.value._id);
    }
    if (e.name === 'default') {
      this.setDefaultLanguage(e.value._id);
    }
    if (e.name === 'edit') {
      this.dialogRef = this.dialog.open(MatDialogCreateLanguageComponent, {
        autoFocus: false,
        restoreFocus: false,
        data: {
          language: e.value,
          editDialog: true,
          parent: this
        }
      });
    }
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
      return  this.selection.clear();
    }else{
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

  onCreateLanguage() {
    this.dialogRef = this.dialog.open(MatDialogCreateLanguageComponent, {
      autoFocus: false,
      restoreFocus: false,
      data: {
        parent: this
      }
    });
  }

  deleteLanguage(id: string) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translateService.instant(TOKENS.MODULES.TRANSLATION.DELETE_TITLE),
        message: this.translateService.instant(TOKENS.MODULES.TRANSLATION.DELETE_CONFIRM)
      }
    });
    confirmDialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.translationDataService.deleteLanguage(id)
          .pipe(catchError((err) => { return throwError(err); }))
          .subscribe(() => {
            this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.TRANSLATION.DELETED));
            const localFilteredData =  this.dataSource.filteredData.filter(item => (item._id !== id));
            this.dataSource = new MatTableDataSource<any>(localFilteredData);
            this.dialog.closeAll();
          });
      }
    });
  }

  setDefaultLanguage(id: string) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translateService.instant(TOKENS.MODULES.TRANSLATION.DEFAULT_TITLE),
        message: this.translateService.instant(TOKENS.MODULES.TRANSLATION.DEFAULT_CONFIRM)
      }
    });
    confirmDialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.translationDataService.setDefaultLanguage({ id })
          .pipe(catchError((err) => { return throwError(err); }))
          .subscribe(() => {
            this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.TRANSLATION.DEFAULT_TRUE));
            const localFilteredData =  this.dataSource.filteredData.map(item => {
              if (item._id === id) {
                item.default_language = true;
              }else if (item.default_language === true && item._id !== id) {
                item.default_language = false;
              }
              return item;
            });
            this.dataSource = new MatTableDataSource<any>(localFilteredData);
            this.dialog.closeAll();
          });
      }
    });
  }
  loadData() {
    this.queryPaginator.numberOfRecordsPerPage = this.pageSize;
    this.queryPaginator.changePage(this.pageIndex, this.pageSize);
    const data = {
      offset: this.pageIndex * this.pageSize,
      size: this.pageSize,
      total: this.dataSource.filteredData.length
    };
    this.queryPaginator.metadata = new MetadataModel(data);
    this.query.paginator = this.queryPaginator;
    this.translationDataService.retrieveLanguagesList(this.query).subscribe();

  }

  handlePageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }
}
