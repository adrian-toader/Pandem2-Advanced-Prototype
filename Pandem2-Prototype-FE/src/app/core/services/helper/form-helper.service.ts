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
import { AbstractControl, UntypedFormControl, NgForm } from '@angular/forms';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {
  /**
     * Retrieve control value
     * @param control
     */
  getControlValue(control: UntypedFormControl): any {
    return (control as any).getFilteredValue ?
      (control as any).getFilteredValue() :
      control.value;
  }

  /**
     * Get all fields of a form, with their values
     * @param {NgForm} form
     * @returns {any}
     */
  getFields(form: NgForm): any {
    const fields = {};

    _.forEach(form.controls, (control: UntypedFormControl, controlName: string) => {
      _.set(
        fields,
        controlName,
        this.getControlValue(control)
      );
    });

    return fields;
  }

  /**
     * Extract the "dirty" fields of a Form
     * @param {NgForm} form
     * @returns {any}
     */
  getDirtyFields(form: NgForm) {
    const dirtyFields = {};

    _.forEach(form.controls, (control: UntypedFormControl, controlName: string) => {
      if (control.dirty) {
        if ((control as any).getDirtyFields) {
          _.each((control as any).getDirtyFields(), (
            childControl: UntypedFormControl,
            childControlName: string
          ) => {
            _.set(dirtyFields, childControlName, childControl.value);
          });
        } else {
          _.set(
            dirtyFields,
            controlName,
            this.getControlValue(control)
          );
        }
      }
    });

    return dirtyFields;
  }

  /**
     * Extract the "dirty" fields from a set of Forms, merging all of them into a single object
     * @param {NgForm[]} forms
     */
  mergeDirtyFields(forms: NgForm[]) {
    let dirtyFields = {};

    _.forEach(forms, (form: NgForm) => {
      // get the dirty fields of each form
      dirtyFields = { ...dirtyFields, ...this.getDirtyFields(form) };
    });

    return dirtyFields;
  }

  /**
     * Merge all the fields from a set of Forms into a single object
     * @param {NgForm[]} forms
     * @returns {any}
     */
  mergeFields(forms: NgForm[]) {
    let fields = {};

    _.forEach(forms, (form: NgForm) => {
      // get the fields of each form
      const formFields = this.getFields(form);

      fields = { ...fields, ...formFields };
    });

    return fields;
  }

  /**
     * Check a set of forms and verify if they are all valid
     * @param {NgForm[]} forms
     * @returns {boolean}
     */
  isFormsSetValid(forms: NgForm[]) {
    let isValid = true;

    _.forEach(forms, (form: NgForm) => {
      isValid = isValid && form.valid;
    });

    return isValid;
  }

  /**
     * Check if a form is modified and valid, otherwise display a meaningful error
     * @param form
     * @param checkForChanges
     * @returns {boolean}
     */
  validateForm(
    form: NgForm,
    checkForChanges: boolean = true
  ) {
    // display invalid error if form is invalid
    if (!form.valid) {
      // determine fields that are invalid
      // let fields: string = '';
      const checkControlsForInvalidStatus = (
        controlsForm: NgForm,
        prefixes: string[] = []
      ) => {
        // check controls validity
        // let lastControlRowIndexes: number[];
        const mustCheckForms: {
          controlsForm: NgForm,
          prefixes: string[]
        }[] = [];
        _.each(controlsForm.controls, (ctrl: AbstractControl, name: string) => {
          // invalid controls
          if (
            ctrl.invalid &&
                        !_.isEmpty(name)
          ) {
            // determine directive
            const directive = _.find((controlsForm as any)._directives, { name: name }) as any;
            if (
              directive &&
                            directive.valueAccessor
            ) {
              // determine row indexes
              // const nameWithIndexes: string = directive.valueAccessor.alternativeName ? directive.valueAccessor.alternativeName : name;
              // const rowIndexes = _.chain(nameWithIndexes.match(/\[\d+\]/g))
              //   .map((v: string) => v.replace(/\[|\]/g, ''))
              //   .map((v: string) => _.parseInt(v) + 1)
              //   .value();

              // do we have placeholder ?
              if (directive.valueAccessor.placeholder) {
                // same row as previous one, if not we need to display data on a new row ?
                // let firstField: boolean = false;
                // if (!_.isEqual(rowIndexes, lastControlRowIndexes)) {
                // add new error row
                // fields += '<br />- ';

                // reset first field label for this row
                // firstField = true;

                // add prefixes
                // let addedItemNo: boolean = false;
                // _.each(rowIndexes, (_rowIndex: number, _index: number) => {
                // do we have a prefix for this item ?
                // let prefix: string = '';
                // if (!_.isEmpty(prefixes[index])) {
                //   prefix = ` ${prefixes[index]}`;
                // }

                // add prefix
                // fields += prefix + ' ' + this.i18nService.instant(
                //     'LNG_FORM_ERROR_FORM_INVALID_WITH_FIELDS_ROW', {
                //         item: rowIndex
                //     }
                // );

                // now we have item numbers
                // addedItemNo = true;
                // });

                // do we need to add : after item numbers ?
                // if (addedItemNo) {
                //   fields += ': ';
                // }
                // }

                // determine field label
                // const fieldLabel: string = this.i18nService.instant(directive.valueAccessor.placeholder);

                // add field label to list of errors
                // fields += firstField ? fieldLabel : `, ${fieldLabel}`;

                // set the new rows
                // lastControlRowIndexes = rowIndexes;
              } else if (
                directive.valueAccessor.groupForm &&
                                directive.valueAccessor.groupForm.controls
              ) {
                // merge old & new prefixes
                const newPrefixes: string[] = _.clone(prefixes);
                // if (directive.valueAccessor.componentTitle) {
                //     newPrefixes.push(this.i18nService.instant(directive.valueAccessor.componentTitle));
                // }

                // determine child fields that are invalid
                // using mustCheckForms to keep input order, otherwise addresses error messages will appear before firstname errors..
                mustCheckForms.push({
                  controlsForm: directive.valueAccessor.groupForm,
                  prefixes: newPrefixes
                });
              }
            }
          }
        });

        // validate remaining form children
        _.each(mustCheckForms, (data: {
          controlsForm: NgForm,
          prefixes: string[]
        }) => {
          checkControlsForInvalidStatus(
            data.controlsForm,
            data.prefixes
          );
        });
      };

      // determine form invalid fields
      checkControlsForInvalidStatus(form);

      // display error message
      // this.snackbarService.showError(
      //     _.isEmpty(fields) ? 'LNG_FORM_ERROR_FORM_INVALID' : 'LNG_FORM_ERROR_FORM_INVALID_WITH_FIELDS',
      //     {
      //         fields: fields
      //     },
      //     true
      // );

      // finished
      return false;
    }

    // should we to display a message if there are no changes ?
    if (checkForChanges) {
      // get dirty fields
      const dirtyFields: any = this.getDirtyFields(form);

      // if there are no changes, display an error
      if (_.isEmpty(dirtyFields)) {
        // this.snackbarService.showSuccess('LNG_FORM_WARNING_NO_CHANGES');
        return false;
      }
    }

    // form is valid
    return true;
  }

  /**
     * Get list of invalid controls
     * @param form
     */
  getInvalidControls(form: NgForm) {
    // we don't handle if there are two controls with the same name
    const invalidControls: {
      [name: string]: AbstractControl
    } = {};
    _.forEach(form.controls, (control: AbstractControl, controlName: string) => {
      if (control.invalid) {
        invalidControls[controlName] = control;
      }
    });

    // finished
    return invalidControls;
  }
}

