import { SearchOptions } from '@data/interface/search-options';

export interface RepairsSearchCriterias {
  repairTitle: string;
  repairStartDate: string | null;
  repairEndDate: string | null;
  repairStatus: number;
}

export interface RepairSearch {
  repairID: number;
  searchCriterias: RepairsSearchCriterias;
  searchOptions: SearchOptions;
}
