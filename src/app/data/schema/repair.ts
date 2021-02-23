import { Moment } from 'moment';

export interface Repair {
  id?: number;
  title: string;
  description: string;
  issueDate: string | Moment;
  cost: number;
  remaining?: number;
}

export class RepairModel implements Repair {
  id?: number;
  title: string;
  description: string;
  issueDate: string;
  cost: number;
  remaining?: number;

  constructor(source: Repair) {
    this.id = source.id;
    this.title = source.title;
    this.description = source.description;
    this.issueDate =
      typeof source.issueDate === 'object'
        ? source.issueDate.format('YYYY-MM-DD')
        : source.issueDate;
    this.cost = source.cost;
  }
}
