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
  Component,
  Input,
  ViewEncapsulation,
  Optional,
  Inject,
  Host,
  SkipSelf,
  HostBinding,
  Output,
  EventEmitter,
  AfterViewInit, ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, NG_ASYNC_VALIDATORS, ControlContainer } from '@angular/forms';
import { ElementBase } from '../../core/index';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-form-input',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.less'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: FormInputComponent,
    multi: true
  }]
})
export class FormInputComponent extends ElementBase<string> implements AfterViewInit, OnDestroy {
  static identifier: number = 0;

  @HostBinding('class.form-element-host') isFormElement = true;

  @Input() placeholder: string;

  @Input() autocomplete: string;

  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() name: string;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;

  private _tooltipToken: string;
  private _tooltip: string;
  @Input() set tooltip(tooltip: string) {
    this._tooltipToken = tooltip;
    // this._tooltip = this._tooltipToken ? this.i18nService.instant(this._tooltipToken, this.tooltipTranslateData) : this._tooltipToken;
    this._tooltip = '';
  }
  get tooltip(): string {
    return this._tooltip;
  }

  private _tooltipTranslateData: any;
  @Input() set tooltipTranslateData(tooltipTranslateData: any) {
    this._tooltipTranslateData = tooltipTranslateData;
    this.tooltip = this._tooltipToken;
  }
  get tooltipTranslateData(): any {
    return this._tooltipTranslateData;
  }

  @Input() displayFilterIcon: boolean = false;

  @Input() tabIndex: number;

  @Input() maxlength: number;
  @Input() minlength: number;

  @Input() step: number = 1;
  @Input() min: number;
  @Input() max: number;

  @Input() displayRefresh: boolean = false;

  @ViewChild('inputElement', { static: true }) inputElement: ElementRef;

  @Output() optionChanged = new EventEmitter<any>();
  @Output() initialized = new EventEmitter<any>();
  @Output() blurEvent = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<any>();

  public identifier = `form-input-${FormInputComponent.identifier++}`;

  tempTypeOverwritten: string;

  // language subscription
  private languageSubscription: Subscription;

  /**
     * Constructor
     */
  constructor(
  @Optional() @Host() @SkipSelf() controlContainer: ControlContainer,
    @Optional() @Inject(NG_VALIDATORS) validators: Array<any>,
    @Optional() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: Array<any>
    // private i18nService: I18nService
  ) {
    super(controlContainer, validators, asyncValidators);

    // on language change..we need to translate again the token
    // this.languageSubscription = this.i18nService.languageChangedEvent
    //     .subscribe(() => {
    //         this.tooltip = this._tooltipToken;
    //     });
  }

  /**
     * Component destroyed
     */
  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
      this.languageSubscription = null;
    }
  }

  /**
     * Trigger the 'touch' action on the custom form control
     */
  onBlur() {
    this.touch();
    this.blurEvent.emit(this.value);
  }

  /**
     * Function triggered when the input value is changed
     */
  onChange() {
    // emit the current value
    return this.optionChanged.emit(this.value);
  }

  /**
     * Trigger to emit when refresh icon is pressed
     */
  onRefreshPressed() {
    this.refresh.emit();
  }

  ngAfterViewInit() {
    // wait for the input object to be initialized
    // then trigger the initialized event
    setTimeout(() => {
      this.initialized.emit(this.value);
    });

    super.ngAfterViewInit();
  }

  /**
     * toggle show / hide password
     */
  togglePasswordDisplay() {
    if (this.tempTypeOverwritten === 'password') {
      this.type = 'password';
      this.tempTypeOverwritten = '';
    } else {
      this.type = 'text';
      this.tempTypeOverwritten = 'password';
    }
  }

  /**
     * Focus input
     */
  focus() {
    // focus input
    if (
      this.inputElement &&
            this.inputElement.nativeElement &&
            this.inputElement.nativeElement.focus
    ) {
      this.inputElement.nativeElement.focus();
    }
  }

  /**
     * Select input
     */
  select() {
    // select input
    if (
      this.inputElement &&
            this.inputElement.nativeElement &&
            this.inputElement.nativeElement.select
    ) {
      this.inputElement.nativeElement.select();
    }
  }
}
