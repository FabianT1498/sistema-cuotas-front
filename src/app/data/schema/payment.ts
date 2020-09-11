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
  monthlyPayments?: MonthlyPayment[];
  repairs?: Repair[];
  contributions?: Contribution[];
}
