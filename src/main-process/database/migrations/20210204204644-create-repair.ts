'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Repairs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      issue_date: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cost: {
        type: Sequelize.REAL,
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
    await queryInterface.dropTable('Repairs');
  }
};
