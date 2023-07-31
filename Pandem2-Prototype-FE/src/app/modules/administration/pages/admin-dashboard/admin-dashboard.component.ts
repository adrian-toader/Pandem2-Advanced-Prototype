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
import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { JobDetailModel, SourceDetailModel } from 'src/app/core/models/source-data.model';
import { ImportDataService } from '../../../../core/services/data/import.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Administration } from '../../../../core/services/data/administration.data.service';
import { TOKENS } from 'src/app/core/models/translate-loader.model';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastService } from 'src/app/core/services/helper/custom-toast.service';
import { GoDataConfig, ModellingConfig, PandemSourceConfig, ServiceGatewayConfig, ServicesStatusesResponse } from 'src/app/core/models/admin-dashboard.interface';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { HttpResponse } from '@angular/common/http';
import { AuthManagementDataService } from 'src/app/core/services/auth-management-data.service';
import { PERMISSION } from '../../../../core/models/permission.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { catchError } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, AfterContentChecked {

  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;

  importResultsColumns: string[] = ['start_date', 'end_date', 'status', 'data_type', 'error'];
  dataSourcesColumns: string[] = ['name', 'active', 'description', 'date'];
  importOptions: string[] = [
    'all',
    'bed',
    'case',
    'death',
    'participatorySurveillance',
    'patient',
    'population',
    'socialMediaAnalysisData',
    'test',
    'vaccine'
  ];
  selectedImports: string[] = ['all'];
  importSuggestion = false;

  pandemSource: PandemSourceConfig = { requestTimeout: 0, url: '' };
  goData: GoDataConfig = { importEnabled: false, url: '', credentials: { clientId: '', clientSecret: '' } };
  modelling: ModellingConfig = { url: '' };
  serviceGateway: ServiceGatewayConfig = { timeout: 0, url: '' };

  // State variable indicating whether to show/hide the configuration card based on user permissions
  haveConfigurationPermissions = false;

  // State variable indicating whether to show/hide the import form based on user permissions
  haveImportPermission = false;

  // State variables to control the disabled state of config buttons.
  // The buttons are disabled by default, and are only enabled if the user has typed something into the input field.
  pandemSourceButtonDisabled: boolean = true;
  goDataButtonDisabled: boolean = true;
  modellingButtonDisabled: boolean = true;
  serviceGatewayButtonDisabled: boolean = true;

  searchSource = '';

  localJobs: JobDetailModel[] = [];
  localSources: SourceDetailModel[] = [];

  importResultsDataSource = new MatTableDataSource();
  sourcesDataSource = new MatTableDataSource();

  sourcesData = undefined;
  importResultsData = undefined;
  sourcesMetadataMap = {};

  cachedSourcesData = undefined;
  cachedImportResultsData = undefined;
  // will hold the status of each service
  servicesStatuses: ServicesStatusesResponse = {
    status: 'out of service',
    services: {
      database: 'out of service',
      pandemSource: 'out of service',
      modelling: 'out of service'
    }
  };
  servicesStatusesSubscription: Subscription;
  constructor(private importDataService: ImportDataService,
    private administration: Administration,
    protected translateService: TranslateService,
    private customToastService: CustomToastService,
    private authManagementDataService: AuthManagementDataService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    // Get the user's permissions
    // If user have configuration_settings_all permision, will set the "haveConfigurationPermissions" variable to true
    this.haveConfigurationPermissions = this.authManagementDataService.getAuthenticatedUser()?.permissionIdsMapped?.[PERMISSION.CONFIGURATION_SETTINGS_ALL] ?? false;
    this.haveImportPermission = this.authManagementDataService.getAuthenticatedUser()?.permissionIdsMapped?.[PERMISSION.START_IMPORT] ?? false;
    this.administration.getServicesStatuses()
      .subscribe((statuses) => {
        this.servicesStatuses = statuses;
      });
  }
  ngAfterContentChecked(): void {
    if (this.paginator2 !== undefined && !_.isEqual(this.cachedSourcesData, this.sourcesData)) {
      this.sourcesDataSource = new MatTableDataSource(this.sourcesData.map(item => {
        return {
          date: moment(this.sourcesMetadataMap[item.sourceIds[0]].date).format('MM.DD.YYYY, HH.mm'),
          name: item.tag,
          description: this.sourcesMetadataMap[item.sourceIds[0]].source_description,
          active: this.sourcesMetadataMap[item.sourceIds[0]].active ? 'Yes' : 'No'
        };
      }));
      this.sourcesDataSource.paginator = this.paginator2;
      if (this.cachedSourcesData === undefined) {
        this.cachedSourcesData = _.cloneDeep(this.sourcesData);
      }
    }
    if (this.paginator1 !== undefined && !_.isEqual(this.cachedImportResultsData, this.importResultsData)) {
      this.importResultsDataSource = new MatTableDataSource(this.importResultsData.map(item => {
        return {
          start_date: moment(item.start_date).format('MM.DD.YYYY, HH.mm'),
          end_date: item.end_date ? moment(item.end_date).format('MM.DD.YYYY, HH.mm') : '',
          status: _.upperCase(item.status),
          data_type: _.upperCase(item.data_type),
          error_message: item.error_message
        };
      }));
      this.importResultsDataSource.paginator = this.paginator1;
      if (this.cachedImportResultsData === undefined) {
        this.cachedImportResultsData = _.cloneDeep(this.importResultsData);
      }
    }
  }

  retrieveData(): void {
    const importResults = this.importDataService.getImportResults({});
    const sources = this.importDataService.getDataSourceTags({});

    // Here, we are retrieving data from multiple sources and assigning the results
    if (this.haveConfigurationPermissions === true) {
      forkJoin([
        this.administration.getPandemSourceConfig(),
        this.administration.getGoDataConfig(),
        this.administration.getModellingConfig(),
        this.administration.getServiceGatewayConfig()
      ]).subscribe(([pandemRes, goDataRes, modellingRes, serviceGatewayRes]) => {
        if (pandemRes) { this.pandemSource = pandemRes; }
        if (goDataRes) { this.goData = goDataRes; }
        if (modellingRes) { this.modelling = modellingRes; }
        if (serviceGatewayRes) { this.serviceGateway = serviceGatewayRes; }
      });
    }

    forkJoin([
      importResults,
      sources
    ]
    ).subscribe(results => {
      this.importResultsData = results[0].data;
      this.sourcesData = results[1].data;
      results[1].metadata.sources.forEach((item) => this.sourcesMetadataMap[item.id] = item);

      this.importResultsDataSource = new MatTableDataSource(this.importResultsData.map(item => {
        return {
          start_date: moment(item.start_date).format('MM.DD.YYYY, HH.mm'),
          end_date: item.end_date ? moment(item.end_date).format('MM.DD.YYYY, HH.mm') : '',
          status: _.upperCase(item.status),
          data_type: _.upperCase(item.data_type),
          error_message: item.error_message
        };
      }));

      this.sourcesDataSource = new MatTableDataSource(this.sourcesData.map(item => {
        return {
          date: moment(this.sourcesMetadataMap[item.sourceIds[0]].date).format('MM.DD.YYYY, HH.mm'),
          name: item.tag,
          description: this.sourcesMetadataMap[item.sourceIds[0]].source_description,
          active: this.sourcesMetadataMap[item.sourceIds[0]].active ? 'Yes' : 'No'
        };
      }));
    });
  }

  lookFor(value): void {
    this.searchSource = value;
    if (value.length >= 4) {
      const auxSources = this.localSources.filter((item) => item.tag.includes(value));
      const auxJobs = this.localJobs.filter((item) => item.source.includes(value));
      this.importResultsDataSource = new MatTableDataSource(auxJobs);
      this.importResultsDataSource.paginator = this.paginator1;
      this.sourcesDataSource = new MatTableDataSource(auxSources);
      this.sourcesDataSource.paginator = this.paginator2;
    } else if (value.length === 0) {
      this.retrieveData();
    }
  }

  resetFilter(): void {
    this.searchSource = '';
    this.retrieveData();
  }
  // This function updates the specified source with the provided data by calling the corresponding API endpoint.
  updateSourceData(sourceName: string, data: any): void {
    this.administration[`update${sourceName}Config`](data).subscribe((response: HttpResponse<null>) => {
      if (response.status === 204) {
        this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.ADMINISTRATION.URL_MSG, {
          source: sourceName
        }
        ));
      }else{
        this.customToastService.showError(this.translateService.instant(TOKENS.ADMINISTRATION.ACCESS_DENIED));
      }
    }
    );
  }

  changePandemURL(): void {
    this.updateSourceData('PandemSource', this.pandemSource);
  }

  changeGoDataURL(): void {
    this.updateSourceData('GoData', this.goData);
  }

  changeModellingUrl(): void {
    this.updateSourceData('Modelling', this.modelling);
  }

  changeServiceGateway(): void {
    this.updateSourceData('ServiceGateway', this.serviceGateway);
  }

  toggleButton(event: MatSlideToggleChange) {
    this.goData.importEnabled = event.checked;
    this.goDataButtonDisabled = false;
  }

  prepareJobData(data: JobDetailModel[]): void {
    const dict = [];
    for (const item of data) {
      const localFind = dict.find((value) => value.souce === item.source);
      if (!localFind) {
        dict.push({
          souce: item.source,
          item
        });
      } else {
        const time = localFind.item.lastImport;
        if (time < item.lastImport) {
          localFind.item = item;
        } else if (time === item.lastImport && localFind.item.lastTime <= item.lastTime) {
          localFind.item = item;
        }
      }
    }
    const localList = [];
    for (const item of dict) {
      localList.push(item.item);
    }
    this.localJobs = localList;
    this.importResultsDataSource = new MatTableDataSource(this.localJobs);
    this.importResultsDataSource.paginator = this.paginator1;
  }

  importFromPandemSource() {
    if (this.haveImportPermission) {
      if (!this.selectedImports.includes('socialMediaAnalysisData') && !this.selectedImports.includes('all') ) {
        this.importSuggestion = false;
      }
      const param = {
        dataType: this.selectedImports,
        importSuggestion: this.importSuggestion
      };
      this.importDataService.importPandemSourceData(param)
        .pipe(catchError((err) => { return throwError(err); }))
        .subscribe();
      this.customToastService.showInfo(this.translateService.instant(TOKENS.MODULES.ADMINISTRATION.IMPORT_STARTED, {
        selectedImports: this.selectedImports
      }));
    }
  }

  showErrorMessage(message: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Error message',
        message: message,
        type: 'info'
      }
    });
  }

  isAllSelected() {
    if (this.selectedImports.includes('all') && this.selectedImports.length > 1) {
      this.selectedImports = ['all'];
    }
  }
  getColor(status: string): string {
    let color = '';
    switch (status) {
      case 'in service (partial)':
        color = 'orange';
        break;
      case 'in service':
        color = 'green';
        break;
      case 'out of service':
        color = 'red';
        break;
      default:
        color = 'gray';
        break;
    }
    return color;
  }
}
