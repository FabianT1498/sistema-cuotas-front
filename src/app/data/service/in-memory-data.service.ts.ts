import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Payment } from '@data/schema/payment';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const payments = [
      {
        id: 0,
        neighborID: 112324,
        neighbor: 'Dr Nice',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 1,
        neighborID: 122323,
        neighbor: 'Narco',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 2,
        neighborID: 132323,
        neighbor: 'Bombasto',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 3,
        neighborID: 142323,
        neighbor: 'Celeritas',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 4,
        neighborID: 152365,
        neighbor: 'Magneta',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 5,
        neighborID: 162323,
        neighbor: 'RubberMan',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 6,
        neighborID: 176232,
        neighbor: 'Dynama',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 7,
        neighborID: 182323,
        neighbor: 'Dr IQ',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 8,
        neighborID: 12324449,
        neighbor: 'Magma',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      },
      {
        id: 9,
        neighborID: 20242424,
        neighbor: 'Tornado',
        paymentDate: '07-12-2020',
        amount: 200,
        paymentMethod: 'Efectivo'
      }
    ];
    return { payments };
  }

  genId(payments: Payment[]): number {
    return payments.length > 0
      ? Math.max(...payments.map(payment => payment.id)) + 1
      : 0;
  }
}
