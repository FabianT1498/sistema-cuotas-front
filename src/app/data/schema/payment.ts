export interface Payment {
  id: number;
  neighbor: string;
  neighborID: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  bank?: string;
  paymentID?: string;
}
