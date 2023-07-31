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
import { JobDetailEntity, SourceDetailEntity } from '../entities/source-data.entity';

export class SourceDetailModel implements SourceDetailEntity
{
  tag: string;
  source: string;
  description: string;
  quality: string;
  frequency: string;
  email: string;

  constructor(data = null) {
    this.tag = _.get(data, 'tag');
    this.source = _.get(data, 'source');
    this.description = _.get(data, 'description');
    this.quality = _.get(data, 'quality');
    this.frequency = _.get(data, 'frequency');
    this.email = _.get(data, 'email');
  }
}
export class JobDetailModel implements JobDetailEntity
{
  source: string;
  status: string;
  files: string;
  size: number;
  lastImport: Date;
  lastImportObject: Date;
  lastImportString: string;
  lastTime: string;
  constructor(data = null)
  {
    this.source = _.get(data, 'source');
    this.status = _.get(data, 'status');
    this.files = _.get(data, 'files');
    this.size = _.get(data, 'size');
    this.size = Number(this.size.toFixed(2));
    this.lastImport = _.get(data, 'lastImport');
    this.lastImportObject = new Date(this.lastImport);
    this.lastImportString = this.lastImportObject.toLocaleDateString();
    this.lastTime = this.lastImportObject.toLocaleTimeString();
  }
}
