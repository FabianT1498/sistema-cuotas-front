'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = [
      {
        cost: 1500000,
        created_at: '2020-12-01',
        updated_at: '2020-12-01'
      }
    ];

    return queryInterface.bulkInsert('Monthly_Payments_Costs', data);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
