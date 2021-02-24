export interface Neighbor {
  id: number;
  dni: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  houseNumber: string;
  street: string;
}

export class NeighborModel implements Neighbor {
  id: number;
  dni: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  houseNumber: string;
  street: string;

  constructor(source: Neighbor) {
    this.id = source.id;
    this.dni = source.dni.toUpperCase();
    this.fullName = source.fullName;

    this.phoneNumber = !this.isUndefined(source.phoneNumber)
      ? source.phoneNumber
      : null;
    this.email = !this.isUndefined(source.email) ? source.email : null;

    this.houseNumber = source.houseNumber.toUpperCase();
    this.street = source.street.toUpperCase();
  }

  private isUndefined(attr) {
    return typeof attr === 'undefined';
  }
}
