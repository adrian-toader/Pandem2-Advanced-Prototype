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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ParticipatorySurveillanceVisitTypes } from 'src/app/core/entities/participatorySurveillance-data.entity';

@Component({
  selector: 'app-participatory-visits-cumulative-select',
  templateUrl: './participatory-visits-cumulative-select.component.html'
})
export class ParticipatoryVisitsCumulativeSelectComponent {
  @Input() selectedVisitCumulativeType;
  @Output() visitCumulativeTypeChanged = new EventEmitter<string>();
  @Input() visitCumulativeTypes = [
    { value: ParticipatorySurveillanceVisitTypes.NoVisit, label: 'No Visit' },
    { value: ParticipatorySurveillanceVisitTypes.Emergency, label: 'Emergency' },
    { value: ParticipatorySurveillanceVisitTypes.GP, label: 'GP' },
    { value: ParticipatorySurveillanceVisitTypes.Plan, label: 'Plan' },
    { value: ParticipatorySurveillanceVisitTypes.Hospital, label: 'Hospital' },
    { value: ParticipatorySurveillanceVisitTypes.Other, label: 'Other' }
  ];
  @Input() isDisabled = false;

  selectionUpdated(value): void {
    this.visitCumulativeTypeChanged.emit(value);
  }
}
