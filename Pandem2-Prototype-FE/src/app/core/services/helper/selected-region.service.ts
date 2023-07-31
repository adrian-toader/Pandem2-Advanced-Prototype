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
import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { RegionModel } from '../../models/region.model';
import { RegionAndNutsModel } from '../../models/regionAndNuts.model';

@Injectable({
  providedIn: 'root'
})

export class SelectedRegionService {
  private regionSource;
  private regionAndNutsSource;
  currentlySelectedRegion;
  currentRegionAndNutsLevel;

  currentRegionList: RegionModel[];
  private regionsSubject = new Subject<RegionModel[]>();

  constructor() {
    this.resetData();
  }

  getListener() {
    return this.regionsSubject.asObservable();
  }

  updateRegionList(regions: RegionModel[]) {
    this.currentlySelectedRegion = regions;
    this.regionsSubject.next([...this.currentlySelectedRegion]);
  }

  changeRegion(region: RegionModel): void {
    this.regionSource.next(region);
  }

  updateNutsLevel(regionAndNuts: RegionAndNutsModel): void {
    this.regionAndNutsSource.next(regionAndNuts);
  }

  public resetData(): void {
    this.regionSource = new ReplaySubject<RegionModel>(1);
    this.currentlySelectedRegion = this.regionSource.asObservable();
    this.regionAndNutsSource = new ReplaySubject<string>(1);
    this.currentRegionAndNutsLevel = this.regionAndNutsSource.asObservable();
  }

}
