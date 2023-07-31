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
import { MetadataModel } from '../../models/base/metadata.model';

export class ListPagePaginator {
  // page size options
  static readonly RECORDS_PER_PAGE_OPTIONS: number[] = [
    50,
    100,
    250,
    500,
    1000
  ];

  // number of records displayed on each page
  static readonly RECORDS_PER_PAGE: number = 50;

  // retrieving data
  retrievingData = false;

  // number of items per page for current component
  numberOfRecordsPerPage: number = ListPagePaginator.RECORDS_PER_PAGE;
  numberOfRecordsPerPageOptions: number[] = ListPagePaginator.RECORDS_PER_PAGE_OPTIONS;

  // list metadata
  metadata: MetadataModel;

  // page
  get page(): number {
    return this.metadata ? Math.floor(this.metadata.offset / this.numberOfRecordsPerPage ) : 0;
  }

  // total records
  get total(): number {
    return this.metadata ? this.metadata.total : 0;
  }

  /**
   * Clone object
   */
  clone(): ListPagePaginator {
    // clone
    const newPaginator = new ListPagePaginator();
    newPaginator.metadata = this.metadata ? this.metadata.clone() : this.metadata;
    newPaginator.numberOfRecordsPerPage = this.numberOfRecordsPerPage;
    newPaginator.numberOfRecordsPerPageOptions = [...this.numberOfRecordsPerPageOptions];

    // finished
    return newPaginator;
  }

  /**
   * Build query
   */
  buildQuery(): string {
    // skip
    let query = '';
    if (
      this.metadata &&
      this.metadata.offset !== undefined
    ) {
      query = query + `${query ? '&' : ''}skip=${this.metadata.offset}`;
    }

    // limit
    if (this.numberOfRecordsPerPage !== undefined) {
      query = query + `${query ? '&' : ''}limit=${this.numberOfRecordsPerPage}`;
    }

    // finished
    return query;
  }

  /**
   * Change page
   */
  changePage(
    pageIndex: number,
    pageSize?: number
  ): void {
    // must have metadata
    if (!this.metadata) {
      return;
    }

    // update page size
    if (pageSize > 0) {
      this.numberOfRecordsPerPage = pageSize;
    }

    // set offset
    this.metadata.offset = Math.max(
      pageIndex * this.numberOfRecordsPerPage,
      0
    );
  }
}
