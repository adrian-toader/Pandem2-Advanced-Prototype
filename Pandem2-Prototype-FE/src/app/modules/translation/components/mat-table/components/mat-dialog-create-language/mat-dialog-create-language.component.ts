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
import { countries_codes } from '../../../../../../../assets/countriesCodes';
import { TranslationDataService } from 'src/app/core/services/data/translation.data.service';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-mat-dialog-create-language',
  templateUrl: './mat-dialog-create-language.component.html',
  styleUrls: ['./mat-dialog-create-language.component.less']
})
export class MatDialogCreateLanguageComponent implements OnInit {
  countries_codes;
  selectedCountryCode: string;
  checkbox_checked: boolean = true;
  display_name: string;
  editDialog: boolean = false;
  id: string;
  constructor(@Inject(MAT_DIALOG_DATA)  public injectedData: any,  public dialog: MatDialog,
    private translationDataService: TranslationDataService
  ) {}

  ngOnInit(): void {
    this.countries_codes = countries_codes;
    if (this.injectedData.editDialog) {
      this.editDialog = true;
      this.checkbox_checked = this.injectedData.language.enabled;
      this.display_name = this.injectedData.language.display_name;
      this.id = this.injectedData.language._id;
    }
  }

  onCountrySelectionChange(event: any) {
    this.selectedCountryCode = event.value;
  }
  onSave() {
    const language_obj = { display_name: this.display_name, country_code: this.selectedCountryCode, enabled: this.checkbox_checked };
    this.translationDataService.createLanguage(language_obj).subscribe((data) => {
      if (data.status === 201) {
        const localFilteredData = [...this.injectedData.parent.dataSource.filteredData, data.body];
        this.injectedData.parent.dataSource = new MatTableDataSource<any>(localFilteredData);
        this.dialog.closeAll();
      }
    });
  }
  onEdit() {
    const language_obj = { display_name: this.display_name, enabled: this.checkbox_checked, id: this.id };
    this.translationDataService.editLanguage(language_obj).subscribe((data) => {
      if (data.status === 204) {
        const localFilteredData = this.injectedData.parent.dataSource.filteredData.map((item) => {
          if (item._id === this.id) {
            item.display_name = this.display_name;
            item.enabled = this.checkbox_checked;
          }
          return item;
        });
        this.injectedData.parent.dataSource = new MatTableDataSource<any>(localFilteredData);
        this.dialog.closeAll();
      }
    });
  }
}
