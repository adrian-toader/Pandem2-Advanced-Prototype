/*
  Copyright Clarisoft, a Modus Create Company, 25/07/2023, licensed under the
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
import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CardManagerComponent } from '../card-manager/card-manager.component';
import { GraphDetail, GraphMananger } from '../../../core/services/helper/graph-manager.service';
export interface GraphListUpdateMessage {
  graphList: GraphDetail[];
  cards: QueryList<CardManagerComponent>;
}

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.less']
})
export class DragDropComponent implements AfterViewInit {
  @Input() graphList: GraphDetail[];
  @Input() parentPage: any;
  @Input() isVariantsPage = false;
  @Output() graphListUpdated: EventEmitter<GraphListUpdateMessage> = new EventEmitter<GraphListUpdateMessage>();
  @Output() cardsUpdated: EventEmitter<QueryList<CardManagerComponent>> = new EventEmitter<QueryList<CardManagerComponent>>();
  @ViewChildren('cardManager') cards: QueryList<CardManagerComponent>;

  constructor(
    private graphManager: GraphMananger
  ) {
  }
  ngAfterViewInit() {
    this.cardsUpdated.emit(this.cards);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.graphList, event.previousIndex, event.currentIndex);
    this.graphManager.graphList = this.graphList;
    const cardManagersArray = this.cards.toArray();

    moveItemInArray(cardManagersArray, event.previousIndex, event.currentIndex);
    cardManagersArray[event.currentIndex].index = event.currentIndex;
    cardManagersArray[event.previousIndex].index = event.previousIndex;
    this.updateFirstLastProperties(event.currentIndex, cardManagersArray);
    this.updateFirstLastProperties(event.previousIndex, cardManagersArray);

    const response: GraphListUpdateMessage = {
      graphList: this.graphList,
      cards: this.cards
    };
    this.graphListUpdated.emit(response);
  }

  updateFirstLastProperties(index: number, cardManagersArray: CardManagerComponent[]) {
    const isFirst = index === 0;
    const isLast = index === cardManagersArray.length - 1;

    cardManagersArray[index].isFirst = isFirst;
    cardManagersArray[index].isLast = isLast;
  }

}
