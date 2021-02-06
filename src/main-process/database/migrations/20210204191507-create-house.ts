'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Houses', {
      house_no: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
      },
      street: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Houses');
  }
};
