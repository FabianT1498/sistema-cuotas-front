'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Neighbors', [
      {
        fullname: 'Ramon Perez',
        dni: 'V-25393651',
        phone_number: '0416-1889298',
        email_address: 'ramon@hotm.com',
        house_no: 'A-14',
        created_at: '2021-01-15',
        updated_at: '2021-01-15'
      },
      {
        fullname: 'Fabian Trillo',
        dni: 'V-26382781',
        phone_number: '0416-1889299',
        email_address: 'fabian@hotm.com',
        house_no: 'A-19',
        created_at: '2021-02-18',
        updated_at: '2021-02-18'
      },
      {
        fullname: 'Carlos Gomez',
        dni: 'V-25393650',
        phone_number: '0416-1889220',
        email_address: 'carlos@hotm.com',
        house_no: 'B-14',
        created_at: '2021-02-30',
        updated_at: '2021-02-30'
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Neighbors', null, {});
  }
};
