'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Monthly_Payments_Costs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cost: {
        type: Sequelize.FLOAT(15),
        allowNull: false
      },
      created_at: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Monthly_Payments_Costs');
  }
};
