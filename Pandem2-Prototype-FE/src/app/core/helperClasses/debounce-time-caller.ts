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
import { Constants } from '../models/constants';

export enum DebounceTimeCallerType {
  RESET_AND_WAIT_FOR_NEXT,
  DONT_RESET_AND_WAIT
}

export class DebounceTimeCaller {
  // The ID value of the timer
  protected refreshTimeoutID: any = null;

  // initialize
  constructor(
    private subscriber: () => void,
    private time: number = Constants.DEFAULT_FILTER_DEBOUNCE_TIME_MILLISECONDS,
    private type: DebounceTimeCallerType = DebounceTimeCallerType.RESET_AND_WAIT_FOR_NEXT
  ) {}

  /**
     * Clear previous refresh request
     */
  protected clearRefreshTimeout(): void {
    if (this.refreshTimeoutID) {
      clearTimeout(this.refreshTimeoutID);
      this.refreshTimeoutID = null;
    }
  }

  /**
     * Execute subscriber
     * @param instant True if you don't want to wait for debounce time
     */
  call(instant: boolean = false) {
    // no subscriber ?
    if (!this.subscriber) {
      return;
    }

    // do we want to execute call instantly ?
    if (instant) {
      // stop the previous one
      this.clearRefreshTimeout();

      // call
      this.subscriber();
    } else {
      this.callAfterMs(this.time);
    }
  }

  /**
     * Call after a specific number of ms
     * @param waitForMs Number of ms to wait before calling subscriber
     */
  callAfterMs(waitForMs: number): void {
    if (
      this.type === DebounceTimeCallerType.RESET_AND_WAIT_FOR_NEXT || (
        this.type === DebounceTimeCallerType.DONT_RESET_AND_WAIT &&
                !this.refreshTimeoutID
      )
    ) {
      // stop previous request
      this.clearRefreshTimeout();

      // wait for debounce time
      // make new request
      this.refreshTimeoutID = setTimeout(() => {
        // no subscriber ?
        if (!this.subscriber) {
          return;
        }

        // timeout executed - clear
        this.refreshTimeoutID = null;

        // call
        this.subscriber();
      }, waitForMs);
    }
  }

  /**
     * Release resources
     */
  unsubscribe(): void {
    if (this.subscriber) {
      this.subscriber = null;
    }
  }
}
