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
import { createRandomIntNumber } from '../components/helpers';
import { ILocationEntry } from '../components/nuts/helpers';
import { NUTSModel } from '../models/nuts';
import { IIntervention, InterventionModel } from '../models/intervention';
import { ILocation } from '../interfaces/common';
import { DataSourceModel } from '../models/dataSource';

const interventionNames = [
  'StayHomeOrder', 
  'RegionalStayHomeOrder',
  'StayHomeRiskG',
  'ClosDaycare',
  'MassGatherAll',
  'BanOnAllEvents',
  'BanOnAllEventsPartial',
  'IndoorOver50',
  'ClosureOfPublicTransport',
  'MasksMandatoryClosedSpaces',
  'Teleworking',
  'EntertainmentVenues',
  'GymsSportsCentresPartial'
];

interface ILocationNameInterventionTotals {
  start_date: string,
  end_date: string,
  description: string,
}

interface ILocationInterventionTotals {
  [key: string]: ILocationNameInterventionTotals
}

/**
 * Generate Dummy data for Intervention
 */
export class InterventionGenerator {
  constructor(
    private pathogenId: string,
    private location: ILocation
  ) {
  }

  /**
   * Create a new intervention statistics payload and returns it
   * @param location
   * @param source
   * @param start_date
   * @param end_date
   * @param name
   * @param description
   * @private
   */
  private createNewIntervention(
    location: ILocationEntry,
    start_date: Date,
    end_date: Date,
    name: string,
    description: string,
    import_metadata: any = {}
  ): IIntervention {
    // intervention data
    const newIntervention: IIntervention = {
      pathogenId: this.pathogenId,
      is_custom: false,
      start_date: start_date,
      end_date: end_date,
      location: {
        reference: `EU.NUTS0${location.level}`,
        value: location.code
      },
      name: name,
      description: description,
      import_metadata: import_metadata
    };

    return newIntervention;
  }

  private async generateDataForRegion(start_date: Date, end_date: Date, location: ILocationEntry): Promise<ILocationInterventionTotals> {
    start_date = new Date(start_date);
    end_date = new Date(end_date);
    let source = await DataSourceModel.findOne();
    if(!source){
      const newSource = new DataSourceModel({
        source: 'GeneratedInterventionSource',
        name: 'GeneratedInterventionSource',
        active: false,
        source_description: 'Auto-genetared source to serve intervention generator.',
        tags: ['intervention-generator'],
      });
      await DataSourceModel.create(newSource);
      source = newSource;
    }
    const totals: ILocationInterventionTotals = {};
    const interventionList: IIntervention[] = [];
    const daysInRange = Math.round((end_date.getTime() - start_date.getTime())/(1000*60*60*24)) + 1;
    for(const name of interventionNames){
      const startOffset = daysInRange == 1? 0 : createRandomIntNumber(0, daysInRange - 1);
      const endOffset = daysInRange == 1? 1 : createRandomIntNumber(startOffset, daysInRange);
      const randStartDate: Date = (new Date(start_date));
      randStartDate.setDate(start_date.getDate() + startOffset);
      const randEndDate: Date = (new Date(start_date));
      randEndDate.setDate(start_date.getDate() + endOffset);
      const newIntervention = this.createNewIntervention(location, randStartDate, randEndDate, name, name, {sourceId: source?._id, importId: source?.importId});
      interventionList.push(newIntervention);
      totals[name] = {
        start_date: randStartDate.toDateString(),
        end_date: randEndDate.toDateString(),
        description: name
      };
    }

    await InterventionModel.deleteMany({
      'location.value': location.code,
      start_date: {
        '$gte': start_date
      },
      end_date: {
        '$lte': end_date
      }
    });

    while (interventionList.length) {
      const batch = interventionList.splice(0, 100);
      await InterventionModel.create(batch);
    }

    return totals;
  }

  public async generateData(start_date: Date, end_date: Date): Promise<ILocationInterventionTotals> {

    const location: ILocationEntry = await NUTSModel.findOne({
      code: this.location.value
    }, null, {
      lean: true
    }) as ILocationEntry;
    const totals: ILocationInterventionTotals = await this.generateDataForRegion(start_date, end_date, location);

    return totals;
  }
}
