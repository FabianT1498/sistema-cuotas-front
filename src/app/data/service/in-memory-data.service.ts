import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Payment } from '@data/schema/payment';
import { Neighbor } from '@data/schema/neighbor';
import { Contribution } from '@data/schema/contribution';
import { MonthlyPayment } from '@data/schema/monthly-payment';
import { Repair } from '@data/schema/repair';

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

    const monthlyPayments = [
      {
        id: 0,
        neighborID: '26382781',
        month: 'Jan',
        year: 2019,
        cost: 200000
      },
      {
        id: 1,
        neighborID: '26382781',
        month: 'Feb',
        year: 2019,
        cost: 200000
      },
      {
        id: 3,
        month: 'Jan',
        neighborID: '26382781',
        year: 2020,
        cost: 500000
      },
      {
        id: 4,
        neighborID: '26382783',
        month: 'Feb',
        year: 2020,
        cost: 500000
      },
      {
        id: 5,
        month: 'Mar',
        neighborID: '26382783',
        year: 2020,
        cost: 700000
      },
      {
        id: 6,
        neighborID: '26382784',
        month: 'Jan',
        year: 2019,
        cost: 200000
      },
      {
        id: 7,
        neighborID: '26382784',
        month: 'Feb',
        year: 2019,
        cost: 200000
      },
      {
        id: 8,
        month: 'Jan',
        neighborID: '26382784',
        year: 2020,
        cost: 500000
      }
    ];

    const repairs = [
      {
        id: 0,
        title: 'Arreglo de alcantarillas',
        description: 'Durante las lluvias explotaron las alcantarillas',
        date: '07-12-2019',
        cost: 600000
      },
      {
        id: 1,
        title: 'Arreglo de porton',
        description: 'Un carro azul choco contra el porton',
        date: '07-04-2020',
        cost: 1000000
      },
      {
        id: 2,
        title: 'Arreglo de transformador',
        description: 'Exploto un trasnformador durante la tormenta electrica',
        date: '07-08-2020',
        cost: 2000000
      }
    ];

    const contributions = [
      {
        id: 0,
        title: 'Aguinaldo de vigilantes',
        date: '07-12-2019'
      },
      {
        id: 1,
        title: 'Aporte para comprar agua',
        date: '05-02-2019'
      },
      {
        id: 2,
        title: 'Aporte para logistica',
        date: '03-09-2019'
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
      }
    ];
    return { payments, neighbors, monthlyPayments, repairs, contributions };
  }

  genId<T extends Payment | Neighbor | Repair | Contribution | MonthlyPayment>(
    collection: T[]
  ): number {
    return collection.length > 0
      ? Math.max(...collection.map(el => el.id)) + 1
      : 0;
  }
}
