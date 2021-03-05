import { SearchOptions } from '@data/interface/search-options';

export interface PaymentsSearchCriterias {
  neighborDNI: string;
  paymentStartDate: string | null;
  paymentEndDate: string | null;
  paymentMethod: string;
  paymentBank: number;
  referenceNumber: string;
}

export interface PaymentSearch {
  neighborID: number;
  searchCriterias: PaymentsSearchCriterias;
  searchOptions: SearchOptions;
}
