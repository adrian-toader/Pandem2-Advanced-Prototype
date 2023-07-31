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
import { PageEvent } from '@angular/material/paginator';
import * as _ from 'lodash';

/**
 * Serialized
 */
export interface ISerializedQueryPaginator {
  limit: number;
  skip: number;
}

/**
 * Paginator
 */
export class RequestPaginator {
  // number of elements to retrieve
  limit: number;
  // number of elements to skip
  skip: number;

  // changes listener
  private changesListener: () => void;

  /**
     * Constructor
     */
  constructor(listener?: () => void) {
    this.changesListener = listener;
  }

  /**
     * Trigger change listener
     */
  private triggerChangeListener(): void {
    // do we have a change listener ?
    if (!this.changesListener) {
      return;
    }

    // trigger change
    this.changesListener();
  }

  /**
     * Change page
     * @param {PageEvent} page
     * @returns {RequestPaginator}
     */
  setPage(
    page: (PageEvent | { pageSize: number, pageIndex: number }),
    disableOnChange: boolean = false
  ): RequestPaginator {
    // limit
    this.limit = page.pageSize;
    this.skip = page.pageSize * page.pageIndex;

    // trigger change
    if (!disableOnChange) {
      this.triggerChangeListener();
    }

    // finished
    return this;
  }

  /**
     * Reset to first page
     * @returns {RequestPaginator}
     */
  reset(): RequestPaginator {
    // reset ?
    this.skip = 0;

    // trigger change
    this.triggerChangeListener();

    // finished
    return this;
  }

  /**
     * Clear pagination criterias
     * @returns {RequestPaginator}
     */
  clear(): RequestPaginator {
    // clear
    delete this.limit;
    delete this.skip;

    // trigger change
    this.triggerChangeListener();

    // finished
    return this;
  }

  /**
     * Check if there are any pagination criterias
     * @returns {boolean}
     */
  isEmpty(): boolean {
    return this.limit === undefined && this.skip === undefined;
  }

  /**
     * Serialize query builder
     */
  serialize(): ISerializedQueryPaginator {
    return {
      limit: this.limit,
      skip: this.skip
    };
  }

  /**
     * Replace query builder filters with saved ones
     */
  deserialize(
    serializedValue: string | ISerializedQueryPaginator
  ): void {
    // deserialize
    const serializedValueObject: ISerializedQueryPaginator = _.isString(serializedValue) ?
      JSON.parse(serializedValue) :
      serializedValue as ISerializedQueryPaginator;

    // update data
    this.limit = serializedValueObject.limit;
    this.skip = serializedValueObject.skip;
  }
}
