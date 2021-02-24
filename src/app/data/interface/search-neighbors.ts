import { SearchOptions } from '@data/interface/search-options';

export interface NeighborSearchCriterias {
  dni: string;
  houseNumber: string;
}

export interface NeighborSearch {
  neighborID: number;
  searchCriterias: NeighborSearchCriterias;
  searchOptions: SearchOptions;
}
