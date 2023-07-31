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
import { ReplaySubject } from 'rxjs';
import { SocialMediaAnalysisInputModel, SocialMediaAnalysisSelectedTopicModel } from '../../models/socialMediaAnalysis-data.model';

@Injectable({
  providedIn: 'root'
})

export class SocialMediaAnalysisInputService {
  currentlySocialMediaAnalysisInput;
  currentlySocialMediaAnalysisSelectedTopic;

  private socialMediaAnalysisInput;
  private socialMediaAnalysisSelectedTopic;

  constructor() {
    this.resetData();
    this.resetSelectedTopicData();
  }

  getListener() {
    return this.socialMediaAnalysisInput.asObservable();
  }

  changeInput(model: SocialMediaAnalysisInputModel): void {
    this.socialMediaAnalysisInput.next(model);
  }

  public resetData(): void {
    this.socialMediaAnalysisInput = new ReplaySubject<SocialMediaAnalysisInputModel>(1);
    this.currentlySocialMediaAnalysisInput = this.socialMediaAnalysisInput.asObservable();
  }

  getSelectedTopicListener() {
    return this.socialMediaAnalysisSelectedTopic.asObservable();
  }

  changeSelectedTopic(model?: SocialMediaAnalysisSelectedTopicModel): void {
    this.socialMediaAnalysisSelectedTopic.next(model);
  }

  public resetSelectedTopicData(): void {
    this.socialMediaAnalysisSelectedTopic = new ReplaySubject<SocialMediaAnalysisSelectedTopicModel>(1);
    this.currentlySocialMediaAnalysisSelectedTopic = this.socialMediaAnalysisSelectedTopic.asObservable();
  }
}
