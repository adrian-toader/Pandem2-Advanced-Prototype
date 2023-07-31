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

import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingCardManagerDialogComponent } from './modelling-card-manager-dialog/modelling-card-manager-dialog.component';

@Component({
  selector: 'app-modelling-card-manager',
  templateUrl: './modelling-card-manager.component.html',
  styleUrls: ['./modelling-card-manager.component.less']
})
export class ModellingCardManagerComponent implements OnInit, OnChanges {

  @Input() index: number;
  @Input() lastIndex: number;
  @Input() chartPage;
  @Input() data: Map<string, GraphDatasource> = new Map();
  @Input() isCollapsed: boolean = false;
  @Input() isSection: boolean = false;
  @Input() isMinimized: boolean = false;
  @Input() isScenarioSaved: boolean = true;
  @Input() isCopyDisabled: boolean = false;
  @Input() showCopyWarning: boolean = false;

  @Output() collapseEvent: EventEmitter<number> = new EventEmitter();
  @Output() moveUpEvent: EventEmitter<number> = new EventEmitter();
  @Output() moveDownEvent: EventEmitter<number> = new EventEmitter();
  @Output() removeEvent: EventEmitter<number> = new EventEmitter();
  @Output() copyToReportEvent: EventEmitter<number> = new EventEmitter();

  isFirst = false;
  isLast = false;
  dialogRef;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.updateIndex();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.index) {
      this.index = changes.index.currentValue;
    }
    if (changes.lastIndex) {
      this.lastIndex = changes.lastIndex.currentValue;
    }
    this.updateIndex();
  }

  addGraph() {
    this.openDialog();
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(ModellingCardManagerDialogComponent, {
      data: {
        parent: this,
        chartPage: this.chartPage,
        data: this.data,
        addToIndex: this.index + 1
      },
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'modelling-exploration-dialog-panel'
    });
  }

  collapseCard() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseEvent.emit(this.index);
  }

  moveUp() {
    this.moveUpEvent.emit(this.index);
  }

  moveDown() {
    this.moveDownEvent.emit(this.index);
  }

  remove() {
    this.removeEvent.emit(this.index);
  }

  copyToReport() {
    this.copyToReportEvent.emit(this.index);
  }

  updateIndex() {
    if (this.index === 0) {
      this.isFirst = true;
    }
    else{
      this.isFirst = false;
    }

    if (this.index === this.lastIndex) {
      this.isLast = true;
    }
    else{
      this.isLast = false;
    }
  }
}
