import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Contribution } from '@data/schema/contribution';
import { Repair } from '@data/schema/repair';

export interface Payment {
  id?: number;
  neighborID: number;
  paymentDate: string | any;
  paymentMethod: string;
  amount: number | null;
  bank?: string;
  referenceNumber?: string | null;
  monthlyPayments?: Array<MonthlyPayment>;
  repairs?: Array<Repair>;
  contributions?: Array<Contribution>;
}

export class PaymentModel implements Payment {
  id?: number;
  neighborID: number;
  paymentDate: string | any;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  bank?: string | null;
  monthlyPayments?: Array<MonthlyPayment>;
  repairs?: Array<Repair>;
  contributions?: Array<Contribution>;

  constructor(source: Payment) {
    this.id = typeof source.id !== 'undefined' ? source.id : -1;
    this.neighborID = source.neighborID;
    this.paymentDate =
      typeof source.paymentDate === 'object'
        ? source.paymentDate.format('YYYY-MM-DD')
        : source.paymentDate;
    this.amount = source.amount;
    this.paymentMethod = source.paymentMethod;

    this.bank = typeof source.bank !== 'undefined' ? source.bank : null;
    this.referenceNumber =
      typeof source.referenceNumber !== 'undefined'
        ? source.referenceNumber
        : null;

    this.monthlyPayments = source.monthlyPayments;
    this.repairs = source.repairs;
    this.contributions = source.contributions;
  }
}
