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
import { ListPagePaginator } from './list/list-page-paginator';

// Ascending / descending sort
export enum ApiQueryBuilderSortMethod {
  ASC = 'asc',
  DESC = 'desc'
}

// Sort field settings
export class ApiQueryBuilderSort {
  // !!!IMPORTANT: every new property must be handled by clone function

  /**
   * Constructor
   */
  constructor(
    public field: string,
    public method: ApiQueryBuilderSortMethod = ApiQueryBuilderSortMethod.ASC
  ) {
  }

  /**
   * Clone
   */
  clone(): ApiQueryBuilderSort {
    return new ApiQueryBuilderSort(
      this.field,
      this.method
    );
  }
}

export class ApiQueryBuilderWhere {
  // !!!IMPORTANT: every new property must be handled by clone function

  // basic conditions
  private conditions = {
    $and: []
  };

  /**
   * Escape string
   */
  static escapeStringForRegex(value: string): string {
    return value
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/&/g, '%26')
      .replace(/#/g, '%23')
      .replace(/\+/g, '%2B');
  }

  /**
   * Clone
   */
  clone(): ApiQueryBuilderWhere {
    // clone where
    const where = new ApiQueryBuilderWhere();
    where.conditions = _.cloneDeep(this.conditions);

    // finished
    return where;
  }

  /**
   * Clear conditions
   */
  clear(): ApiQueryBuilderWhere {
    // clear conditions
    this.conditions = {
      $and: []
    };

    // finished
    return this;
  }

  /**
   * Remove field condition
   */
  removeFieldCondition(field: string): ApiQueryBuilderWhere {
    this.conditions.$and = this.conditions.$and.filter((item) => {
      // remove field condition
      if (item.hasOwnProperty(field)) {
        delete item[field];
      }

      // if item is empty ..remove from array
      return !_.isEmpty(item);
    });

    // finished - allow chaining
    return this;
  }

  /**
   * Check if field value contains a specific text (case insensitive)
   */
  byTextContains(
    field: string,
    containsText: string,
    overwrite: boolean = true
  ): ApiQueryBuilderWhere {
    // remove field condition ?
    if (overwrite) {
      this.removeFieldCondition(field);
    }

    // ignore empty values
    if (!containsText) {
      // finished - allow chaining
      return this;
    }

    // create condition
    this.conditions.$and.push({
      [field]: {
        $regex: `${ApiQueryBuilderWhere.escapeStringForRegex(containsText)}`,
        $options: 'i'
      }
    });

    // finished - allow chaining
    return this;
  }

  /**
   * Check if a field value is in a list of values
   */
  bySelectOptions(
    field: string,
    options: string[],
    overwrite: boolean = true,
    notIn: boolean = false
  ): ApiQueryBuilderWhere {
    // remove field condition ?
    if (overwrite) {
      this.removeFieldCondition(field);
    }

    // ignore empty values
    if (
      !options ||
      options.length < 1
    ) {
      // finished - allow chaining
      return this;
    }

    // create condition
    this.conditions.$and.push({
      [field]: {
        [notIn ? '$nin' : '$in']: options
      }
    });

    // finished - allow chaining
    return this;
  }

  /**
   * Check if field value is the provided text (case insensitive)
   */
  bySelectOptionsCaseInsensitive(
    field: string,
    options: string[]
  ): ApiQueryBuilderWhere {
    // remove field condition ?
    // #TODO
    // if (overwrite) {
    //   this.removeFieldCondition(field);
    // }

    // ignore empty values
    if (
      !options ||
      options.length < 1
    ) {
      // finished - allow chaining
      return this;
    }

    // create condition
    const or = [];
    options.forEach((eqText) => {
      or.push({
        [field]: {
          $regex: `^${ApiQueryBuilderWhere.escapeStringForRegex(eqText)}$`,
          $options: 'i'
        }
      });
    });

    // add it query
    this.conditions.$and.push({
      $or: or
    });

    // finished - allow chaining
    return this;
  }

  /**
   * Check if field value is the provided one (default: for string => case insensitive)
   */
  byEquality(
    field: string,
    eqValue: any,
    overwrite: boolean = true,
    caseInsensitive: boolean = true
  ): ApiQueryBuilderWhere {
    // remove field condition ?
    if (overwrite) {
      this.removeFieldCondition(field);
    }

    // ignore empty values
    if (
      eqValue === '' ||
      eqValue === undefined ||
      eqValue === null
    ) {
      // finished - allow chaining
      return this;
    }

    // create condition
    this.conditions.$and.push({
      [field]: caseInsensitive && _.isString(eqValue) ?
        {
          $regex: `^${ApiQueryBuilderWhere.escapeStringForRegex(eqValue)}$`,
          $options: 'i'
        } : {
          $eq: eqValue
        }
    });

    // finished - allow chaining
    return this;
  }

  /**
   * By equality with restrictions
   */
  byEqualityWithRestrictions(
    field: string,
    eqValue: any,
    caseInsensitive: boolean = true,
    emptyChar?: string,
    minLength?: number,
    maxLength?: number
  ): ApiQueryBuilderWhere | null {
    // prepare value before making the query
    if (eqValue) {
      // replace empty chars
      if (emptyChar) {
        eqValue = eqValue.replace(
          new RegExp(emptyChar, 'g'),
          ''
        );
      }

      // if we don't have a value we need to filter without this field
      // don't search if length is less than minLength
      if (
        eqValue &&
        minLength &&
        eqValue.length < minLength
      ) {
        return null;
      }

      // if we don't have a value we need to filter without this field
      // don't search if length is greater than maxLength
      if (
        eqValue &&
        maxLength &&
        eqValue.length > maxLength
      ) {
        return null;
      }
    }

    // add condition
    return this.byEquality(
      field,
      eqValue,
      true,
      caseInsensitive
    );
  }

  /**
   * Check if field value is the provided one (default: for string => case insensitive)
   */
  byNotEqual(
    field: string,
    eqValue: any,
    overwrite: boolean = true,
    caseInsensitive: boolean = true
  ): ApiQueryBuilderWhere {
    // remove field condition ?
    if (overwrite) {
      this.removeFieldCondition(field);
    }

    // ignore empty values
    if (
      eqValue === '' ||
      eqValue === undefined ||
      eqValue === null
    ) {
      // finished - allow chaining
      return this;
    }

    // create condition
    this.conditions.$and.push({
      [field]: caseInsensitive && _.isString(eqValue) ?
        {
          $regex: `^(?!(${ApiQueryBuilderWhere.escapeStringForRegex(eqValue)})$).*`,
          $options: 'i'
        } : {
          $ne: eqValue
        }
    });

    // finished - allow chaining
    return this;
  }

  /**
   * Filter by adding a custom condition
   */
  byCustomCondition(condition: {
    [itemKey: string]: any
  }): ApiQueryBuilderWhere {
    // add condition
    this.conditions.$and.push(condition);

    // finished - allow chaining
    return this;
  }

  /**
   * Build where
   */
  build(stringify: boolean = true): string | { $and: any } {
    return stringify ?
      JSON.stringify(this.conditions) :
      this.conditions;
  }

  /**
   * Check if we have any conditions
   */
  isEmpty(): boolean {
    return this.conditions.$and.length < 1;
  }
}

export class ApiQueryBuilder {
  // !!!IMPORTANT: every new property must be handled by clone function

  // add flags  to query
  private flags: {
    [flag: string]: any
  } = {};

  // fields to retrieve
  private projection: string[] = [];

  // sort by fields
  private defaultSortByFields: ApiQueryBuilderSort[] = [];
  private sortByFields: ApiQueryBuilderSort[] = [];

  // where handler
  private whereHandler: ApiQueryBuilderWhere = new ApiQueryBuilderWhere();

  public get where(): ApiQueryBuilderWhere {
    return this.whereHandler;
  }

  // paginator handler
  private paginatorHandler: ListPagePaginator;

  public set paginator(paginator: ListPagePaginator) {
    this.paginatorHandler = paginator ? paginator.clone() : paginator;
  }

  public get paginator(): ListPagePaginator {
    return this.paginatorHandler;
  }

  /**
   * Create query builder clone
   */
  clone(): ApiQueryBuilder {
    // clone
    const qb = new ApiQueryBuilder();
    qb.flags = _.cloneDeep(this.flags);
    qb.projection = [...this.projection];
    qb.sortByFields = this.sortByFields.map((sortItem) => sortItem.clone());
    qb.defaultSortByFields = this.defaultSortByFields.map((sortItem) => sortItem.clone());
    qb.whereHandler = this.whereHandler.clone();
    qb.paginatorHandler = this.paginatorHandler ?
      this.paginatorHandler.clone() :
      this.paginatorHandler;

    // finished
    return qb;
  }

  /**
   * Set default sort by
   */
  setDefaultSortByFields(...fields: ApiQueryBuilderSort[]): ApiQueryBuilder {
    // set default sort by fields
    this.defaultSortByFields = fields;

    // finished - allow chaining
    return this;
  }

  /**
   * Remove default sort by fields
   */
  clearDefaultSort(): ApiQueryBuilder {
    // clear
    this.defaultSortByFields = [];

    // finished - allow chaining
    return this;
  }

  /**
   * Sort by fields
   */
  sortBy(...fields: ApiQueryBuilderSort[]): ApiQueryBuilder {
    // add to list of sort by fields
    this.sortByFields.push(...fields);

    // finished - allow chaining
    return this;
  }

  /**
   * Remove all sort by fields
   */
  clearSort(): ApiQueryBuilder {
    // clear
    this.sortByFields = [];

    // finished - allow chaining
    return this;
  }

  /**
   * Clear paginator
   */
  clearPaginator(): ApiQueryBuilder {
    // clear
    this.paginator = undefined;

    // finished - allow chaining
    return this;
  }

  /**
   * Convert flag value to query data (must be a flag that is registered on this query builder)
   */
  flagToQueryData(flag: string): any {
    // not a flag of our query builder ?
    if (!this.flags[flag]) {
      return null;
    }

    // convert to query data depending of flag type
    const flagData: any = this.flags[flag];
    switch (typeof flagData) {
      // boolean
      case 'boolean':
      case 'number':
      case 'string':
        return flagData.toString();

      // default type
      default:
        return JSON.stringify(flagData);
    }
  }

  /**
   * Build query
   */
  build(): string {
    // add sort
    const sort = {};
    this.sortByFields.forEach((fieldData) => {
      sort[fieldData.field] = fieldData.method === ApiQueryBuilderSortMethod.ASC ? 1 : -1;
    });

    // no sort defined, then check if we have a default sort
    if (_.isEmpty(sort)) {
      this.defaultSortByFields.forEach((fieldData) => {
        sort[fieldData.field] = fieldData.method === ApiQueryBuilderSortMethod.ASC ? 1 : -1;
      });
    }

    // where
    const where = this.where.isEmpty() ? false : this.where.build();

    // construct final request string
    let buildResponse = '';

    // sort
    if (!_.isEmpty(sort)) {
      buildResponse = buildResponse + `${buildResponse ? '&' : ''}sort=${JSON.stringify(sort)}`;
    }

    // flags
    if (!_.isEmpty(this.flags)) {
      Object.keys(this.flags).forEach((flag: string) => {
        buildResponse = buildResponse + `${buildResponse ? '&' : ''}${flag}=${this.flagToQueryData(flag)}`;
      });
    }

    // where
    if (!_.isEmpty(where)) {
      buildResponse = buildResponse + `${buildResponse ? '&' : ''}filter=${where}`;
    }

    // paginator
    if (this.paginatorHandler) {
      const pageQuery = this.paginatorHandler.buildQuery();
      if (pageQuery) {
        buildResponse = buildResponse + (buildResponse ? '&' : '') + pageQuery;
      }
    }

    // projection
    if (
      this.projection &&
      this.projection.length > 0
    ) {
      // transform to object since this is how API expects it
      const projection = {};
      this.projection.forEach((projectedField) => {
        projection[projectedField] = 1;
      });

      // add it to filter
      buildResponse = buildResponse + `${buildResponse ? '&' : ''}projection=${JSON.stringify(projection)}`;
    }

    // finished
    return buildResponse;
  }

  /**
   * Set flag
   */
  flag(
    flag: string,
    value: any
  ): ApiQueryBuilder {
    // set flag
    this.flags[flag] = value;

    // finished - allow chaining
    return this;
  }

  /**
   * Unset flag
   */
  flagUnset(flag: string): ApiQueryBuilder {
    // unset flag
    delete this.flags[flag];

    // finished - allow chaining
    return this;
  }

  /**
   * Clear flags
   */
  clearFlags(
    keepFlags?: {
      [flag: string]: true
    }
  ): ApiQueryBuilder {
    // clear flags
    if (!keepFlags) {
      this.flags = {};
    } else {
      // filter flags
      const oldFlags: {
        [flag: string]: any
      } = this.flags;
      this.flags = {};
      _.each(oldFlags, (value: any, flag: string) => {
        // don't keep flag ?
        if (!keepFlags[flag]) {
          return;
        }

        // keep this one
        this.flags[flag] = value;
      });
    }

    // finished - allow chaining
    return this;
  }

  /**
   * Project field
   */
  project(...field: string[]): ApiQueryBuilder {
    this.projection.push(...field);

    // finished - allow chaining
    return this;
  }

  /**
   * Clear projection
   */
  clearProjection(): void {
    this.projection = [];
  }

  /**
   * Build query and attach to URL
   */
  attachToUrl(url: string): string {
    return url.indexOf('?') > -1 ?
      `${url}&${this.build()}` :
      `${url}?${this.build()}`;
  }
}
