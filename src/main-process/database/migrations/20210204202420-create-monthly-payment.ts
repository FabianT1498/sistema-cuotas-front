'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Monthly_Payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      month: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      year: {
        type: Sequelize.STRING(4),
        allowNull: false
      },
      cost: {
        type: Sequelize.REAL,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Monthly_Payments');
  }
};
