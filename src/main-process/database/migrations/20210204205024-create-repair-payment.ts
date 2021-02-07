'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Repairs_Payments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        amount: {
          type: Sequelize.REAL,
          allowNull: false
        }
      })
      .then(() =>
        queryInterface.addColumn('Repairs_Payments', 'repair_id', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Repairs', // name of Target model
            key: 'id' // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: false
        })
      )
      .then(() =>
        queryInterface.addColumn('Repairs_Payments', 'payment_id', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Payments', // name of Target model
            key: 'id' // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: false
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Repairs_Payments');
  }
};
