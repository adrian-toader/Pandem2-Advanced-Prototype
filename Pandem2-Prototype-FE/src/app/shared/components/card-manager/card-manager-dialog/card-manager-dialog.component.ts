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

import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphSearchTypes } from 'src/app/core/services/helper/graph-manager.service';

@Component({
  selector: 'app-card-manager-dialog',
  templateUrl: './card-manager-dialog.component.html',
  styleUrls: ['./card-manager-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CardManagerDialogComponent implements OnInit {

  @ViewChild('cardManagerAutocompleteInput', { static: true }) cardManagerAutocompleteInput: ElementRef;
  @ViewChild(MatMenuTrigger, { static: true }) graphsMenuTrigger: MatMenuTrigger;

  myControl = new UntypedFormControl();
  filteredOptions: Observable<{ name: string, id: string }[]>;

  type;
  graphTypes = GraphSearchTypes;
  searchList: any;
  input = '';
  filterList: { name: string, id: string }[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  createFilter() {
    for (const menu of this.searchList) {
      if (this.type === GraphSearchTypes.Graph) {
        for (const submenu of menu.subcategories) {
          this.filterList = [...this.filterList, ...submenu.graphs];
        }
      }

      else if (this.type === GraphSearchTypes.Map) {
        this.filterList = [...this.filterList, ...menu.maps];
      }
    }
  }

  private _filter(value) {
    const filterValue = value.toLowerCase();
    return this.filterList.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  selectOption(value) {
    this.click(this.filterList.find((item) => item.name === value.option.value).id);
  }

  ngOnInit(): void {
    this.searchList = this.data.searchList;
    this.type = this.data.type;
    this.createFilter();
    this.filteredOptions = this.myControl.valueChanges.pipe(map(value => {
      if (value.length > 0) {
        this.graphsMenuTrigger.closeMenu();
        return (value ? this._filter(value) : this.filterList.slice());
      } else {
        this.graphsMenuTrigger.openMenu();
        this.cardManagerAutocompleteInput.nativeElement.focus();
        return [];
      }
    }));
  }

  click(id: string) {
    if (id) {
      if (this.type === GraphSearchTypes.Map) {
        this.data.parent.addNewGraph(id, this.type);
      }
      else if (this.type === GraphSearchTypes.Graph) {
        this.data.parent.addNewGraph(id);
      }
    }
  }

  onClickInput() {
    if (this.myControl.value) {
      this.graphsMenuTrigger.closeMenu();
    } else {
      this.graphsMenuTrigger.openMenu();
      this.cardManagerAutocompleteInput.nativeElement.focus();
    }
  }

}
