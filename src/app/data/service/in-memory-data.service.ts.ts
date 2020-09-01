import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Payment } from '@data/schema/payment';
import { Neighbor } from '@data/schema/neighbor';


@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const neighbors = [
      {
        id: 0,
        neighborID: '26382781',
        fullName: 'Fabian Trillo',
        phoneNumber: '0414-8942584',
        email: 'fabiantrillo1498@gmail.com',
        houseNumber: 'a-8'
      },
      {
        id: 1,
        neighborID: '26382782',
        fullName: 'Fabian Malave',
        phoneNumber: '0414-8942584',
        email: 'fabianmalave1498@gmail.com',
        houseNumber: 'a-9'
      },
      {
        id: 2,
        neighborID: '26382783',
        fullName: 'Fabian Gonzalez',
        phoneNumber: '0414-8942584',
        email: 'fabiangon1498@gmail.com',
        houseNumber: 'b-8'
      },
      {
        id: 3,
        neighborID: '26382784',
        fullName: 'Barbara Trillo',
        phoneNumber: '0414-8942584',
        email: 'barbaratrillo1498@gmail.com',
        houseNumber: 'c-8'
      }
    ];

    const payments = [
      {
        id: 0,
        neighborID: '26382781',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 1,
        neighborID: '26382781',
        paymentDate: '09-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 2,
        neighborID: '26382783',
        paymentDate: '07-12-2019',
        amount: 200,
        paymentMethod: 'Pago movil',
        bank: 'Banco de Venezuela',
        paymentID: '2983BA'
      },
    ];
    return { payments, neighbors };
  }

  genId<T extends Payment | Neighbor>(collection: T[]): number {
    return collection.length > 0
      ? Math.max(...collection.map(el => el.id)) + 1
      : 0;
  }
}
