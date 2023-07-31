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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { CdkDragEnter, CdkDropList, DragRef, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { UserModel } from '../../../../core/models/user.model';
import { Router } from '@angular/router';
import { UserLandingCard } from '../../../../core/entities/user.entity';
import { UserDataService } from '../../../../core/services/data/user.data.service';
import { StorageKey, StorageService } from '../../../../core/services/helper/storage.service';
import { RegionModel } from 'src/app/core/models/region.model';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { DateFormatISODate } from 'src/app/shared/constants';
import * as _ from 'lodash';
import { Constants } from '../../../../core/models/constants';
import * as moment from 'moment';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.component.html',
  styleUrls: ['./landing.component.less']
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  currentUser: UserModel;
  currentUserCards: UserLandingCard[];
  Constants = Constants;
  startDate;
  endDate;
  moment = moment;
  boxWidth: number;
  boxHeight: number;
  private target: CdkDropList = null;
  private targetIndex: number;
  private source: CdkDropList = null;
  private sourceIndex: number;
  private dragRef: DragRef = null;

  @ViewChild('myCard') myElement: ElementRef;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  defaultCards: UserLandingCard[] = Constants.DEFAULT_CARDS;

  constructor(
    private authService: AuthManagementDataService,
    private router: Router,
    private userService: UserDataService,
    private storageService: StorageService,
    private selectedRegion: SelectedRegionService,
    private cdRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();

    if (this.currentUser === null) {
      this.router.navigate(['/login']);
      return;
    }

    // set current location to user's default location
    const regionModel = new RegionModel({
      code: this.currentUser.location,
      name: this.currentUser.locationName
    });
    this.selectedRegion.changeRegion(regionModel);

    // get custom date interval
    const userDataInterval = this.storageService.getUserDataInterval();
    if (userDataInterval && userDataInterval.custom) {
      if (userDataInterval.startDate) {
        this.startDate = userDataInterval.startDate.format(DateFormatISODate);
      }
      if (userDataInterval.endDate) {
        this.endDate = userDataInterval.endDate.format(DateFormatISODate);
      }
    }

    // always get data until current day
    if (!this.endDate) {
      this.endDate = moment().format(DateFormatISODate);
    }

    // default start from 3 months earlier
    if (
      !this.startDate ||
      moment.utc(this.startDate).isBefore(moment.utc(this.endDate).subtract(3, 'months'))
    ) {
      this.startDate = moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
    }

    // only display cards which are not hidden
    this.currentUserCards = this.currentUser.landingCards.length
      ? this.currentUser.landingCards || this.defaultCards
      : this.defaultCards;

    // this is to account for changes in the landing page
    const currentUserCardCodes: string[] = this.currentUserCards.map((card) => card.code).sort();
    const defaultCardCodes: string[] = this.defaultCards.map((card) => card.code).sort();

    if (!_.isEqual(currentUserCardCodes, defaultCardCodes)) {
      this.currentUserCards = this.defaultCards;
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const placeholderElement = this.placeholder.element.nativeElement;

    placeholderElement.style.display = 'none';
    placeholderElement.parentNode.removeChild(placeholderElement);

    this.updateElementSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateElementSize();
  }

  private updateElementSize() {
    const element = this.myElement.nativeElement;
    this.boxWidth = element.offsetWidth;
    this.boxHeight = element.offsetHeight;
    this.cdRef.detectChanges();
  }

  updateUserPreferences(): void {
    this.userService.modifyUser(this.currentUser.id, {
      landing_cards: this.currentUserCards
    }).subscribe((updatedUser) => {
      // update user preferences in local storage
      const currentUserData = this.storageService.get(StorageKey.AUTH_MANAGEMENT_DATA);
      this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, Object.assign({}, currentUserData, { user: updatedUser }));
    });
  }

  onDropListDropped() {
    if (!this.target) {
      return;
    }

    const placeholderElement: HTMLElement =
      this.placeholder.element.nativeElement;
    const placeholderParentElement: HTMLElement =
      placeholderElement.parentElement;

    placeholderElement.style.display = 'none';

    placeholderParentElement.removeChild(placeholderElement);
    placeholderParentElement.appendChild(placeholderElement);
    placeholderParentElement.insertBefore(
      this.source.element.nativeElement,
      placeholderParentElement.children[this.sourceIndex]
    );

    if (this.placeholder._dropListRef.isDragging()) {
      this.placeholder._dropListRef.exit(this.dragRef);
    }

    this.target = null;
    this.source = null;
    this.dragRef = null;

    if (this.sourceIndex !== this.targetIndex) {
      moveItemInArray(this.currentUserCards, this.sourceIndex, this.targetIndex);
      // creating a new reference array in order for angular to detect the changes
      this.currentUserCards = [].concat(this.currentUserCards);

      // update landing cards position for current user
      this.updateUserPreferences();
    }
  }

  onDropListEntered({ item, container }: CdkDragEnter) {
    if (container === this.placeholder) {
      return;
    }

    const placeholderElement: HTMLElement =
      this.placeholder.element.nativeElement;
    const sourceElement: HTMLElement = item.dropContainer.element.nativeElement;
    const dropElement: HTMLElement = container.element.nativeElement;
    const dragIndex: number = Array.prototype.indexOf.call(
      dropElement.parentElement.children,
      this.source ? placeholderElement : sourceElement
    );
    const dropIndex: number = Array.prototype.indexOf.call(
      dropElement.parentElement.children,
      dropElement
    );

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = item.dropContainer;

      placeholderElement.style.width = this.boxWidth + 13 + 'px';
      placeholderElement.style.height = '100%';
      placeholderElement.style.paddingLeft = '0.75rem';
      placeholderElement.style.paddingRight = '0.75rem';

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = container;
    this.dragRef = item._dragRef;

    placeholderElement.style.display = '';

    dropElement.parentElement.insertBefore(
      placeholderElement,
      dropIndex > dragIndex ? dropElement.nextSibling : dropElement
    );

    this.placeholder._dropListRef.enter(
      item._dragRef,
      item.element.nativeElement.offsetLeft,
      item.element.nativeElement.offsetTop
    );
  }

  /**
   * Hide card from landing page and save user preferences
   * @param cardCode - card to hide
   */
  hideCard(cardCode: string): void {
    this.currentUserCards.forEach((card: UserLandingCard, idx: number) => {
      if (card.code === cardCode) {
        // hide cards to reload with changes
        this.currentUserCards[idx].hidden = true;

        // creating a new reference array in order for angular to detect the changes
        this.currentUserCards = [].concat(this.currentUserCards);

        // save hidden card preference
        this.updateUserPreferences();
      }
    });
  }

  /**
   *  Show card on landing page and save user preferences
   * @param cardCode - card code to show
   */
  showCard(cardCode: string): void {
    this.currentUserCards.forEach((card: UserLandingCard, idx: number) => {
      if (card.code === cardCode) {
        // hide cards to reload with changes
        this.currentUserCards[idx].hidden = false;

        // creating a new reference array in order for angular to detect the changes
        this.currentUserCards = [].concat(this.currentUserCards);

        // save hidden card preference
        this.updateUserPreferences();
      }
    });
  }
}
