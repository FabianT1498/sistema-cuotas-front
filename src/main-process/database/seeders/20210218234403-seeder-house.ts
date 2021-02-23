'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Houses', [
      {
        house_no: 'A-14',
        street: 'Calle finlandia',
        created_at: '2021-01-15',
        updated_at: '2021-01-15'
      },
      {
        house_no: 'A-19',
        street: 'Calle finlandia',
        created_at: '2021-02-18',
        updated_at: '2021-02-18'
      },
      {
        house_no: 'B-14',
        street: 'Calle finlandia',
        created_at: '2021-02-30',
        updated_at: '2021-02-30'
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Houses', null, {});
  }
};
