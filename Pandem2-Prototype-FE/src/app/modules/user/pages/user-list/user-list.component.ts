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

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { defaultIfEmpty, Observable, throwError } from 'rxjs';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserModel } from '../../../../core/models/user.model';
import { UserDataService } from '../../../../core/services/data/user.data.service';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { DialogAnswerButton, HoverRowAction, HoverRowActionType } from '../../../../shared/components';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { ListComponent } from '../../../../core/helperClasses/list-component';
import { DialogAnswer } from '../../../../shared/components/dialog/dialog.component';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { IBasicCount } from '../../../../core/models/basic-count.interface';
import { ListHelperService } from '../../../../core/services/helper/list-helper.service';
import { VisibleColumnModel } from '../../../../shared/components/side-columns/model';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../../core/models/translate-loader.model';
import { PERMISSION } from '../../../../core/models/permission.model';
import { saveAs } from 'file-saver';
import { HttpResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { ApiQueryBuilder } from '../../../../core/helperClasses/api-query-builder';
import { ListPagePaginator } from '../../../../core/helperClasses/list/list-page-paginator';
import { MetadataModel } from '../../../../core/models/base/metadata.model';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less']
})
export class UserListComponent extends ListComponent implements OnInit, OnDestroy, AfterViewInit {
  protected readonly PERMISSION = PERMISSION;
  breadcrumbs: BreadcrumbItemModel[] = [
    new BreadcrumbItemModel('Users', '.', true)
  ];
  // Autocomplete variables
  searchControl = new FormControl('');
  filteredOptions: Observable<UserModel[]>;
  query = new ApiQueryBuilder();
  queryPaginator = new ListPagePaginator();

  totalItems: number;
  itemsPerPage: number[] = [18, 36];
  pageNumber: number = 0;
  pageSize: number = 18;
  searchText: string = '';
  tableFontSize: string = '16px';
  tableRowsHeight: string = '45px';
  tableRowsPadding: string = '2px 0';
  isCompactTable: boolean = false;
  // Create a MatTableDataSource instance to hold the data
  dataSource: MatTableDataSource<UserModel> = new MatTableDataSource<UserModel>([]);

  // Declare a reference to MatPaginator
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  // authenticated user
  authUser: UserModel;

  // constants
  UserModel = UserModel;
  // PhoneNumberType = PhoneNumberType;
  // UserSettings = UserSettings;

  // list of existing users
  usersList$: Observable<UserModel[]>;
  usersListCount$: Observable<IBasicCount>;
  countriesList;
  recordActions: HoverRowAction[] = [
    // View User
    new HoverRowAction({
      icon: 'visibility',
      iconTooltip: 'View User',
      linkGenerator: (item: UserModel): string[] => {
        return ['/users', item.id, 'view'];
      },
      visible: (_item: UserModel): boolean => {
        return UserModel.canViewCurrent(this.authUser, _item);
      }
    }),

    // Modify User
    new HoverRowAction({
      icon: 'settings',
      iconTooltip: 'Modify User',
      linkGenerator: (item: UserModel): string[] => {
        return ['/users', item.id, 'modify'];
      },
      visible: (_item: UserModel): boolean => {
        return UserModel.canModifyCurrent(this.authUser, _item);
      }
    }),

    // Other actions
    new HoverRowAction({
      type: HoverRowActionType.MENU,
      icon: 'moreVertical',
      menuOptions: [
        // Delete User
        new HoverRowAction({
          menuOptionLabel: 'Delete User',
          click: (item: UserModel) => {
            this.deleteUser(item);
          },
          visible: (item: UserModel): boolean => {
            return item.id !== this.authUser.id &&
              UserModel.canDelete(this.authUser);
          },
          class: 'mat-menu-item-delete'
        })
      ]
    })
  ];

  /**
   * Constructor
   */
  constructor(
    protected listHelperService: ListHelperService,
    private userDataService: UserDataService,
    private authDataService: AuthManagementDataService,
    private dialogService: DialogService,
    private nutsDataService: NutsDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
    super(listHelperService);
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  ngAfterViewInit(): void {
    if (!this.refreshingList) {
      this.dataSource.paginator = this.paginator;
    }
  }

  /**
   * Component initialized
   */
  ngOnInit(): void {
    document.documentElement.style.setProperty('--table-font-size', this.tableFontSize);
    document.documentElement.style.setProperty('--table-rows-padding', this.tableRowsPadding);
    document.documentElement.style.setProperty('--table-rows-height', this.tableRowsHeight);
    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();
    this.nutsDataService.getRegions('0').subscribe((data) => {
      this.countriesList = data;
    });

    // get the Users Count
    this.refreshListCount();

    // initialize pagination
    this.initPaginator();

    // ...and load the list of items
    this.needsRefreshList(true);

    // initialize Side Table Columns
    this.initializeSideTableColumns();

  }

  /**
   * Release resources
   */
  ngOnDestroy(): void {
    // release parent resources
    super.ngOnDestroy();
  }

  /**
   * Initialize Side Table Columns
   */
  initializeSideTableColumns(): void {
    // default table columns
    this.tableColumns = [
      new VisibleColumnModel({
        field: 'lastName',
        label: 'Last Name'
      }),
      new VisibleColumnModel({
        field: 'firstName',
        label: 'First Name'
      }),
      new VisibleColumnModel({
        field: 'email',
        label: 'email'
      }),
      new VisibleColumnModel({
        field: 'location',
        label: 'location'
      }),
      new VisibleColumnModel({
        field: 'role',
        label: 'role'
      }),
      new VisibleColumnModel({
        field: 'status',
        label: 'Account Status'
      })
    ];
  }

  /**
   * Re(load) the Users list
   */
  refreshList(finishCallback: (records: any[]) => void): void {
    // get the list of existing users
    if (this.authUser.hasPermissions(PERMISSION.USER_ALL)) {
      if (!this.query.paginator) {
        this.queryPaginator.numberOfRecordsPerPage = this.pageSize;
        this.queryPaginator.changePage(this.pageIndex, this.pageSize);
        const data = {
          offset: this.pageIndex,
          size: this.pageSize,
          total: this.totalItems
        };
        this.queryPaginator.metadata = new MetadataModel(data);
        this.query.paginator = this.queryPaginator;
      }
      this.userDataService.getUsersListPaginated(this.query).subscribe((data: UserModel[]) => {
        this.dataSource.data = data;
        this.refreshingList = false;
      });
    }
    else {
      const currentUser = this.userDataService
        .getUser(this.authUser.id)
        .pipe(catchError((err) => {
          finishCallback([]);
          return throwError(err);
        }),
        tap(this.checkEmptyList.bind(this)),
        tap((data: any) => {
          finishCallback(data);
        })
        );
      this.usersList$ = currentUser.pipe(
        map(user => [user]), // Wrap the user in an array
        defaultIfEmpty([]) // Handle the case when no user is returned
      );
      this.usersList$.subscribe((data: any[]) => {
        this.dataSource.data = data;
      });
    }
  }

  /**
   * Get total number of items, based on the applied filters
   */
  refreshListCount(): void {
    if (this.authUser.hasPermissions(PERMISSION.USER_ALL)) {
      this.usersListCount$ = this.userDataService.getUsersCount();
      this.usersListCount$.subscribe((data: IBasicCount) => {
        this.totalItems = data.count;
        this.paginator.length = data.count;
      });
    }
  }

  deleteUser(user: UserModel): void {
    // show confirm dialog to confirm the action
    this.dialogService.showConfirm('Are you sure you want to delete this user: \'' + user.firstName + ' ' + user.lastName + '\'')
      .subscribe((answer: DialogAnswer) => {
        if (answer.button === DialogAnswerButton.Yes) {
          // delete the user
          this.userDataService
            .deleteUser(user.id)
            .pipe(
              catchError((err) => {
                this.customToastService.showError(err.error.message);
                return throwError(err);
              })
            )
            .subscribe(() => {
              this.customToastService.showInfo(this.translateService.instant(TOKENS.USERS.DELETED,
                {
                  user: user.name
                }));
              // reload data
              this.needsRefreshList(true);
            });
        }
      });
  }

  getCountryName(countryCode: string): string {
    const country = this.countriesList.find(x => x.code === countryCode);
    return country ? (country.english_name || country.name) : '';
  }

  handleFileInput(files: FileList): void {
    if (files.length > 0) {
      const file = files[0];
      const formData = new FormData();
      formData.append('excel', file);
      this.userDataService.importUsers(formData).subscribe(
        () => {
          this.customToastService.showSuccess(this.translateService.instant(TOKENS.IMPORT_EXPORT.IMPORT_SCC));
          this.needsRefreshList(true);
        },
        () => {
          this.customToastService.showError(this.translateService.instant(TOKENS.IMPORT_EXPORT.IMPORT_ERR));
        }
      );
    }
  }
  handleExport(): void {
    this.userDataService.exportUsers().subscribe(
      (response: HttpResponse<Blob>) => {
        const fileName = 'pandem2-users.xlsx';

        const fileContent = response.body;

        saveAs(fileContent, fileName);

        this.customToastService.showSuccess(this.translateService.instant(TOKENS.IMPORT_EXPORT.EXPORT_SCC));
        this.needsRefreshList(true);
      },
      () => {
        this.customToastService.showError(this.translateService.instant(TOKENS.IMPORT_EXPORT.EXPORT_ERR));
      });
  }

  handleTemplate(): void {
    this.userDataService.downloadTemplate().subscribe(
      (response: HttpResponse<Blob>) => {
        const fileName = 'pandem2-users-template.xlsx';

        const fileContent = response.body;

        saveAs(fileContent, fileName);

        this.customToastService.showSuccess(this.translateService.instant(TOKENS.IMPORT_EXPORT.TEMPLATE_SCC));
        this.needsRefreshList(true);
      },
      () => {
        this.customToastService.showError(this.translateService.instant(TOKENS.IMPORT_EXPORT.TEMPLATE_ERR));
      });
  }

  handlePageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
    this.changeTableSize();
  }

  loadData(): void {
    this.query.paginator.changePage(this.pageIndex, this.pageSize);

    this.refreshList((records: any[]) => {
      this.dataSource.data = records;
    });

  }

  lookFor(value): void {
    this.searchText = value;
    this.pageNumber = 0;
    this.pageIndex = 0;
    if (this.searchText.length > 2) {
      this.query.where.byTextContains('email', this.searchText);
    } else {
      this.query.where.clear();
    }
    this.loadData();
  }

  private _filter(value: string): UserModel[] {
    if (!value || value.length < 3) {
      this.loadData();
    }
    const filterValue = value ? value.toString().toLowerCase() : '';
    this.lookFor(filterValue);
    return this.dataSource.data.filter(option => option.email.toLowerCase().includes(filterValue));
  }

  // Function to handle selection from autocomplete
  optionSelected(option: string): void {
    this.searchText = option;
    this.searchControl.setValue(option);
    this.lookFor(option);
  }
  resetFilter(): void {
    this.searchControl.setValue('');
    this.searchText = '';
    this.query.where.clear();
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(null),
      map(value => this._filter(value || ''))
    );
    this.dataSource.data = [];
  }

  changeTableSize(): void {
    if (this.pageSize === 36) {
      this.tableFontSize = '14px';
      this.tableRowsHeight = '22.5px';
      this.tableRowsPadding = '0';
      this.isCompactTable = true;
    } else {
      this.tableFontSize = '16px';
      this.tableRowsHeight = '45px';
      this.tableRowsPadding = '2px 0';
      this.isCompactTable = false;
    }
    document.documentElement.style.setProperty('--table-font-size', this.tableFontSize);
    document.documentElement.style.setProperty('--table-rows-height', this.tableRowsHeight);
    document.documentElement.style.setProperty('--table-rows-padding', this.tableRowsPadding);
  }
}
