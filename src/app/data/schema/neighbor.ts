export interface Neighbor {
  neighborID: number;
  fullName: string;
  neighborDNI: string;
  phoneNumber?: string;
  email?: string;
  houseNumber: string;
}

export class NeighborModel implements Neighbor {
  neighborID: number;
  fullName: string;
  neighborDNI: string;
  phoneNumber?: string;
  email?: string;
  houseNumber: string;

  constructor(source: Neighbor) {
    this.neighborID = source.neighborID;
    this.fullName = source.fullName;
    this.neighborDNI = source.neighborDNI.toUpperCase();
    this.phoneNumber = source.phoneNumber;
    this.email = source.email;
    this.houseNumber = source.houseNumber.toUpperCase();
  }
}
