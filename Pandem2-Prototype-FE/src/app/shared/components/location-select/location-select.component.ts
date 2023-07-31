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

import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { NutsDataService } from '../../../core/services/data/nuts.data.service';
import { SelectedRegionService } from '../../../core/services/helper/selected-region.service';
import { AuthManagementDataService } from '../../../core/services/auth-management-data.service';
import { RegionModel } from '../../../core/models/region.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.less']
})
export class LocationSelectComponent implements OnInit, OnDestroy {
  @Input() includeAllRegion: boolean = false;

  toggleStyle = ['primary-button', 'primary-button-selected'];
  toggleArray = [1, 0, 0, 0];
  nutsLevel = 0;
  countryList = [];
  allRegions = [];
  originalCountryList = [];

  selectedRegionCode;
  selectedRegionName;

  expandedSelection = false;

  searchControl = new UntypedFormControl();
  searchInput = '';

  sortControl = new UntypedFormControl();
  selectedFilter: 'country' | 'county' = 'country';
  sortTypeCountry: 'asc' | 'desc' = 'asc';
  sortTypeCounty: 'asc' | 'desc' = 'asc';

  constructor(
    protected nutsData: NutsDataService,
    protected selectedRegionData: SelectedRegionService,
    private authDataService: AuthManagementDataService,
    private eRef: ElementRef
  ) {
  }

  ngOnInit(): void {
    // Get countries and regions
    this.nutsData.getRegions(this.nutsLevel.toString()).subscribe((data) => {
      if (this.includeAllRegion) {
        data.unshift(new RegionModel({
          name: 'All',
          code: 'All',
          level: 0
        }));
      }
      this.countryList = _.orderBy(data, [(country) => country.english_name || country.name], [this.sortTypeCountry]);
      this.allRegions = _.orderBy(data, [(country) => country.english_name || country.name], [this.sortTypeCounty]);
      this.originalCountryList = _.cloneDeep(this.countryList);
    });
    this.countryList.forEach(x => x.children = []);

    // Get location from user auth data
    const authUser = this.authDataService.getAuthenticatedUser();
    setTimeout(() => {
      this.selectedRegionCode = authUser.location;
      this.onRegionChange(this.selectedRegionCode, authUser.locationName);
    });

    // Subscribe to location
    this.selectedRegionData.currentlySelectedRegion.subscribe((value) => {
      this.selectedRegionCode = value.code;
      if (value.english_name !== undefined && this.nutsLevel === 0) {
        this.selectedRegionName = value.english_name;
      } else {
        this.selectedRegionName = value.name;
      }
    });

    // Subscribe to select region input changes
    this.searchControl.valueChanges.subscribe(val => {
      this.searchInput = val;
      this.updateCountryList();
    });

    // Set selected filter for sort then subscribe for changes
    this.sortControl.patchValue(this.selectedFilter);
    this.sortControl.valueChanges.subscribe(val => {
      this.selectedFilter = val;
    });
  }

  ngOnDestroy(): void {
    this.selectedRegionData.resetData();
  }

  switchToggle(array, nuts): void {
    this.toggleArray = array;
    this.nutsLevel = nuts;
    if (this.nutsLevel === 0) {
      this.updateCountryList();
    } else {
      this.countryList = [];
      this.nutsData.getRegions(this.nutsLevel.toString()).subscribe((data) => {
        // Change all regions based on nuts level
        this.allRegions = _.orderBy(data, [(country) => country.english_name || country.name], [this.sortTypeCounty]);
        if (this.nutsLevel !== 0) {
          this.countryList = _.orderBy(this.countryList, [(country) => country.english_name || country.name], [this.sortTypeCountry]);
          for (const item of this.countryList) {
            const localFind = this.allRegions.filter(x => x.code.includes(item.code));
            item.children = _.orderBy(localFind, [(country) => country.english_name || country.name], [this.sortTypeCounty]);
          }
        }
        this.updateCountryList();
      });
    }
  }

  updateCountryList(): void {
    if (this.nutsLevel === 0) {
      // Get the original
      this.countryList = _.cloneDeep(this.originalCountryList);
      // Filter searchbar
      this.countryList = this.countryList.filter(x => {
        if (x.english_name !== undefined) {
          return x.english_name.toLowerCase().includes(this.searchInput.toLowerCase());
        } else {
          return x.name.toLowerCase().includes(this.searchInput.toLowerCase());
        }
      });
      // Order by sort asc/desc
      this.countryList = _.orderBy(
        this.countryList,
        [(country) => country.english_name || country.name],
        [this.sortTypeCountry]
      );
    } else {
      this.countryList = _.cloneDeep(this.originalCountryList);
      this.countryList = _.orderBy(
        this.countryList,
        [(country) => country.english_name || country.name],
        [this.sortTypeCountry]
      );
      // iterate thorugh country children
      for (const item of this.countryList) {
        item.children = this.allRegions.filter(x => {
          if (x.english_name !== undefined) {
            return x.code.includes(item.code) && x.english_name.toLowerCase().includes(this.searchInput.toLowerCase());
          } else {
            return x.code.includes(item.code) && x.name.toLowerCase().includes(this.searchInput.toLowerCase());
          }
        });
        item.children = _.orderBy(item.children, [(child) => child.english_name || child.name], [this.sortTypeCounty]);
      }

      // Remove countries that don't have any children
      this.countryList = this.countryList.filter(x => x.children.length > 0);
    }
  }

  onRegionChange(newRegionCode, newRegionName, english_name?): void {
    const regionModel = new RegionModel({
      code: newRegionCode,
      name: newRegionName
    });
    if (english_name) {
      regionModel.english_name = english_name;
    }
    this.selectedRegionData.changeRegion(regionModel);
    this.searchControl.patchValue(this.selectedRegionName);
    this.expandedSelection = false;
  }

  onSearchClick(): void {
    this.expandedSelection = true;
  }

  onSearchFocus(): void {
    // Empty the search bar if the text is the same as current region
    if (this.searchControl.value === this.selectedRegionName) {
      this.searchControl.patchValue('');
    }
  }

  onSortClick(): void {
    if (this.selectedFilter === 'country') {
      if (this.sortTypeCountry === 'asc') {
        this.sortTypeCountry = 'desc';
      } else {
        this.sortTypeCountry = 'asc';
      }
    }

    if (this.selectedFilter === 'county') {
      if (this.sortTypeCounty === 'asc') {
        this.sortTypeCounty = 'desc';
      } else {
        this.sortTypeCounty = 'asc';
      }
    }

    this.updateCountryList();
  }

  // Close location select when user clicks outside
  @HostListener('document:click', ['$event'])
  clickout(event): void {
    if (!this.eRef.nativeElement.contains(event.target) && event.target.className !== 'mat-option-text') {
      this.expandedSelection = false;

      // If user didn't select anything, reset the input text
      if (this.searchControl.value === '') {
        this.searchControl.patchValue(this.selectedRegionName);
      }
    }
  }
}
