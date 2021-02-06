'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Payments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        amount: {
          type: Sequelize.REAL,
          allowNull: false
        },
        payment_date: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        payment_method: {
          type: Sequelize.TEXT,
          allowNull: false
        }
      })
      .then(() => {
        return queryInterface.addColumn(
          'Payments', // name of Target model
          'neighbor_id', // name of the key we're adding
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'Neighbors', // name of Source model
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          }
        );
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Payments');
  }
};
