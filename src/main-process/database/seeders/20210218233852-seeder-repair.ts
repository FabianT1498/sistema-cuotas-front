'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Repairs', [
      {
        title: 'Explosión de transformador',
        description: 'Subida de voltaje',
        issue_date: '2021-01-13',
        cost: 3000000,
        created_at: '2021-01-15',
        updated_at: '2021-01-15'
      },
      {
        title: 'Explosión de alcantarilla',
        description: 'Subida de nivel del estanque',
        issue_date: '2021-02-13',
        cost: 1500000,
        created_at: '2021-02-18',
        updated_at: '2021-02-18'
      },
      {
        title: 'Explosión de transformador',
        description: 'Subida de voltaje',
        issue_date: '2021-02-22',
        cost: 10000000,
        created_at: '2021-02-30',
        updated_at: '2021-02-30'
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Repairs', null, {});
  }
};
