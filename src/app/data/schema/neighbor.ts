export interface Neighbor {
  neighborID: number;
  neighborDNI: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  houseNumber?: string;
}

export class NeighborModel implements Neighbor {
  neighborID: number;
  neighborDNI: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  houseNumber?: string;

  constructor(source: Neighbor) {
    this.neighborID = source.neighborID;
    this.neighborDNI = source.neighborDNI.toUpperCase();
    this.fullName = !this.isUndefined(source.fullName) ? source.fullName : null;
    this.phoneNumber = !this.isUndefined(source.phoneNumber)
      ? source.phoneNumber
      : null;
    this.email = !this.isUndefined(source.email) ? source.email : null;
    this.houseNumber = !this.isUndefined(source.houseNumber)
      ? source.houseNumber.toUpperCase()
      : null;
  }

  private isUndefined(attr) {
    return typeof attr === 'undefined';
  }
}
