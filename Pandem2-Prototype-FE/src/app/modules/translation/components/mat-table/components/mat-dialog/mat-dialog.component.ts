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
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslationDataService } from 'src/app/core/services/data/translation.data.service';
import { Scheduler } from '@translate-tools/core/util/Scheduler';
import { GoogleTranslator } from '@translate-tools/core/translators/GoogleTranslator';

const translator = new GoogleTranslator();
const scheduler = new Scheduler(translator);

@Component({
  selector: 'app-mat-dialog',
  templateUrl: './mat-dialog.component.html',
  styleUrls: ['./mat-dialog.component.less']
})
export class MatDialogComponent implements OnInit {
  dataLoaded: boolean = true;
  currentItem: { key: string, baseValue: string, value: string; };
  currentIndex: number = 0;
  constructor(@Inject(MAT_DIALOG_DATA)  public injectedData: any,
    public dialog: MatDialog, private translationDataService: TranslationDataService) {}

  ngOnInit() {
    this.currentItem = this.injectedData.item;
    this.currentIndex = this.injectedData.index;
  }
  onSave() {
    this.translationDataService.translateText(this.injectedData.parent.targetCultureId, { country_code: this.injectedData.selectedTargetCulture, key: this.currentItem.key, value: this.currentItem.value }).subscribe((data) => {
      if (data.status === 204) {
        this.dialog.closeAll();
      }
    });
  }
  onSaveAndNext() {
    this.translationDataService.translateText(this.injectedData.parent.targetCultureId, { country_code: this.injectedData.selectedTargetCulture, key: this.currentItem.key, value: this.currentItem.value }).subscribe((data) => {
      if (data.status === 204) {
        this.currentItem = this.injectedData.dataSource.filteredData[this.currentIndex + 1];
        this.currentIndex++;
        if ((this.currentIndex % this.injectedData.parent.pageSize) === 0) {
          this.injectedData.parent.currentPageIndex++;
          this.injectedData.parent.dataSource = new MatTableDataSource<any>(this.injectedData.parent.dataSource.filteredData);
          this.injectedData.parent.paginator.pageIndex = this.injectedData.parent.currentPageIndex;
          this.injectedData.parent.dataSource.paginator = this.injectedData.parent.paginator;
        }
      }
    });

  }

  onGTranslateClick() {
    scheduler
      .translate(this.currentItem.baseValue, this.injectedData.parent.selectedBaseCulture, this.injectedData.parent.selectedTargetCulture)
      .then((translate) => this.currentItem.value = translate);
  }
}
