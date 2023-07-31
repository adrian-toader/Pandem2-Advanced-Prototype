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
import * as _ from 'lodash';

export enum RequestSortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Serialized
 */
export interface ISerializedQuerySort {
  criterias: any;
}

/**
 * Sort
 */
export class RequestSort {
  // criterias to sort by
  public criterias = {};

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
     * Adds a "sort" criteria
     * Note: If there is already another criteria on the same property, it will be replaced
     * @param property
     * @param direction
     * @returns {RequestSort}
     */
  by(
    property: string,
    direction: RequestSortDirection = RequestSortDirection.ASC
  ): RequestSort {
    // add sorting criteria
    this.criterias[property] = direction;

    // trigger change
    this.triggerChangeListener();

    // finished
    return this;
  }

  /**
     * Remove criteria applied on a specific property
     * @param {string} property
     * @returns {RequestSort}
     */
  remove(property: string): RequestSort {
    // remove ?
    delete this.criterias[property];

    // trigger change
    this.triggerChangeListener();

    // finished
    return this;
  }

  /**
     * Remove all criterias
     * @returns {RequestSort}
     */
  clear(): RequestSort {
    // clear
    this.criterias = {};

    // trigger change
    this.triggerChangeListener();

    // finished
    return this;
  }

  /**
     * Check if there are any criterias set
     * @returns {boolean}
     */
  isEmpty(): boolean {
    return Object.keys(this.criterias).length === 0;
  }

  /**
     * Merge sort criteria
     * @param sort
     */
  merge(
    sort: RequestSort
  ): RequestSort {
    // merge ?
    this.criterias = {
      ...this.criterias,
      ...sort.criterias
    };

    // trigger change
    this.triggerChangeListener();

    // finished
    return this;
  }

  /**
     * Generates a new "order" criteria for Loopback API
     * @returns {{}}
     */
  generateCriteria(): any {
    return this.isEmpty() ?
      [] :
      _.map(this.criterias, (direction, property) => {
        return `${property} ${direction}`;
      });
  }

  /**
     * Serialize query builder
     */
  serialize(): ISerializedQuerySort {
    return {
      criterias: this.criterias
    };
  }

  /**
     * Replace query builder filters with saved ones
     */
  deserialize(
    serializedValue: string | ISerializedQuerySort
  ): void {
    // deserialize
    const serializedValueObject: ISerializedQuerySort = _.isString(serializedValue) ?
      JSON.parse(serializedValue) :
      serializedValue as ISerializedQuerySort;

    // update data
    this.criterias = serializedValueObject.criterias;
  }
}
