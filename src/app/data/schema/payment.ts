import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Contribution } from '@data/schema/contribution';
import { Repair } from '@data/schema/repair';

export interface Payment {
  id?: number;
  neighborID: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  bank?: string;
  paymentID?: string;
  monthlyPayments?: Array<MonthlyPayment | number>;
  repairs?: Array<Repair | number>;
  contributions?: Array<Contribution | number>;
}

export class PaymentModel implements Payment {
  id?: number;
  neighborID: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  bank?: string;
  paymentID?: string;
  monthlyPayments?: Array<MonthlyPayment | number>;
  repairs?: Array<Repair | number>;
  contributions?: Array<Contribution | number>;

  constructor(source: Payment) {
    this.id = source.id;
    this.neighborID = source.neighborID;
    this.paymentDate = source.paymentDate;
    this.amount = source.amount;
    this.paymentMethod = source.paymentMethod;
    this.bank = source.bank;
    this.paymentID = source.paymentID;
    this.monthlyPayments = source.monthlyPayments.map(
      (el: MonthlyPayment) => el.id
    );
    this.repairs = source.repairs.map((el: Repair) => el.id);
    this.contributions = source.contributions.map((el: Contribution) => el.id);

    /*
     we moved the data manipulation to this separate class,
     which is also a valid representation of a User model,
     so no unnecessary clutter here
    */
  }
}
