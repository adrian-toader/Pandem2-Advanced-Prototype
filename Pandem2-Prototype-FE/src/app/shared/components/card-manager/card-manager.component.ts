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

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  GraphDetail,
  GraphMananger,
  GraphSearchTypes,
  MapDetail,
  ReportCardItemTypes, ReportFooter,
  ReportModellingExplorationChart,
  ReportModellingSection,
  ReportTitle
} from 'src/app/core/services/helper/graph-manager.service';
import { CardManagerDialogComponent } from './card-manager-dialog/card-manager-dialog.component';
import { AuthManagementDataService } from '../../../core/services/auth-management-data.service';
import { ReportCardModel } from '../../../core/models/report-card.model';
import { CustomToastService } from '../../../core/services/helper/custom-toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TOKENS } from '../../../core/models/translate-loader.model';

@Component({
  selector: 'app-card-manager',
  templateUrl: './card-manager.component.html',
  styleUrls: ['./card-manager.component.less']
})
export class CardManagerComponent implements OnInit {

  @Input() graphId = '';
  @Input() parentPage: any;
  @Input() isOnReportPage = false;
  @Input() isOnInterventionPage = false;
  @Input() graphParameters;
  graphDetail: ReportCardItemTypes;
  graph: any;
  isFirst = false;
  isLast = false;
  index = 0;
  isCollapsed = false;
  isAdded = false;
  dialogRef;
  hasAccessToReports: boolean;

  constructor(
    protected graphManager: GraphMananger,
    public dialog: MatDialog,
    private authDataService: AuthManagementDataService,
    private customToastService: CustomToastService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    // retrieve user
    const user = this.authDataService.getAuthenticatedUser();
    this.hasAccessToReports = ReportCardModel.canView(user);

    const searchList = this.isOnReportPage ? this.graphManager.reportCardList : this.graphManager.graphList;
    const localFind = searchList.find((item) =>
      (item instanceof GraphDetail || item instanceof MapDetail || item instanceof ReportModellingSection || item instanceof ReportModellingExplorationChart) && item.graphId === this.graphId
    );
    if (localFind) {
      this.graphDetail = localFind;
      if (localFind instanceof GraphDetail) {
        this.graph = localFind.refComponent;
      } else {
        this.graph = null;
      }
    }
    this.updateIndex();
  }

  openDialog(): void {
    // reinitialize options before opening dialog
    this.graphManager.createSearchFilterByPermissions();
    this.dialogRef = this.dialog.open(CardManagerDialogComponent, {
      data: {
        parent: this,
        searchList: this.graphManager.getFilterList(),
        type: GraphSearchTypes.Graph
      },
      autoFocus: false,
      restoreFocus: false
    });
  }

  addNewGraph(id: string) {
    const graph = this.graphManager.allGraphs.find((item) => item.graphId === id);
    if (graph && !this.isOnReportPage) {
      this.graphManager.graphList.splice(this.index + 1, 0, graph);
    } else if (graph && this.isOnReportPage) {
      this.graphManager.reportCardList.splice(this.index + 1, 0, graph);
    }

    if (this.isOnReportPage) {
      this.parentPage.updatePage();
    } else {
      this.parentPage.updateIndex();
    }

    this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.CHART_ADDED, {
      chart: this.graphManager.graphIdNameMap[graph.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
    }
    ));
    this.dialogRef.close();
  }

  collapseCard() {
    this.graph.collapse();
    if (this.isCollapsed) {
      this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.EXPANDED, {
        chart: this.graphManager.graphIdNameMap[this.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
      }));
    } else {
      this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.COLLAPSED, {
        chart: this.graphManager.graphIdNameMap[this.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
      }));
    }
    this.isCollapsed = !this.isCollapsed;
  }

  addToReportCard() {
    const graph = this.graphManager.allGraphs.find((item) => item.graphId === this.graphId);
    if (this.graphParameters) {
      graph.parameters = this.graphParameters;
    }
    this.graphManager.addToReportCard(graph);
    this.isAdded = true;
    this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.CARD_ADDED_TO_REPORT, {
      chart: this.graphManager.graphIdNameMap[this.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
    }));
  }

  moveDown() {
    const secondIndex = this.index + 1;
    const localList = this.isOnReportPage ? this.graphManager.reportCardList : this.graphManager.graphList;
    [localList[this.index], localList[secondIndex]] = [localList[secondIndex], localList[this.index]];
    this.parentPage.updateIndex();
    this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.MOVED_DOWN, {
      chart: this.graphManager.graphIdNameMap[this.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
    }));
  }

  moveUp() {
    const secondIndex = this.index - 1;
    const localList = this.isOnReportPage ? this.graphManager.reportCardList : this.graphManager.graphList;
    [localList[this.index], localList[secondIndex]] = [localList[secondIndex], localList[this.index]];
    this.parentPage.updateIndex();
    this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.MOVED_UP, {
      chart: this.graphManager.graphIdNameMap[this.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
    }));
  }

  updateIndex() {
    if (!this.isOnReportPage) {
      if (this.graphDetail instanceof GraphDetail) {
        this.index = this.graphManager.graphList.indexOf(this.graphDetail);
        this.parentPage.graphList = this.graphManager.graphList;
        if (this.index === 0) {
          this.isFirst = true;
        } else {
          this.isFirst = false;
        }
        if (this.index === this.graphManager.graphList.length - 1) {
          this.isLast = true;
        } else {
          this.isLast = false;
        }
        this.isAdded = false;
        for (const item of this.graphManager.reportCardList) {
          if (item instanceof GraphDetail && item.graphId === this.graphId) {
            this.isAdded = true;
            break;
          }
        }
      }
    } else {
      this.updateIndexReport();
    }
  }

  updateIndexReport() {
    this.index = this.graphManager.reportCardList.indexOf(this.graphDetail);
    if (this.index === 0 || (this.index === 1 && this.isTitle(this.graphManager.reportCardList[0]) )) {
      this.isFirst = true;
    } else {
      this.isFirst = false;
    }
    if (this.index === this.graphManager.reportCardList.length - 1 ||
      (this.index === this.graphManager.reportCardList.length - 2 &&
        this.isFooter(this.graphManager.reportCardList[this.graphManager.reportCardList.length - 1]))
    ) {
      this.isLast = true;
    } else {
      this.isLast = false;
    }
  }

  remove() {
    this.graphManager.remove(this.graphId);
    this.parentPage.updatePage();
    this.customToastService.showInfo(this.translateService.instant(TOKENS.CARD_MANAGER.REMOVED, {
      chart: this.graphManager.graphIdNameMap[this.graphId] || this.translateService.instant(TOKENS.CARD_MANAGER.CHART)
    }));
  }

  isTitle(item: ReportCardItemTypes) {
    return item instanceof ReportTitle;
  }
  isFooter(item: ReportCardItemTypes) {
    return item instanceof ReportFooter;
  }
}
