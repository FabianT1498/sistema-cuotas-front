'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Electronic_Payments', {
        payment_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: false,
          allowNull: false
        },
        reference_number: {
          type: Sequelize.STRING,
          allowNull: false
        }
      })
      .then(() => {
        return queryInterface.addColumn(
          'Electronic_Payments', // name of Target model
          'bank_id', // name of the key we're adding
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'Banks', // name of Source model
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: false
          }
        );
      })
      .then(() =>
        queryInterface.addIndex('Electronic_Payments', {
          fields: ['reference_number', 'bank_id'],
          unique: true
        })
      )
      .then(() =>
        queryInterface.addConstraint('Electronic_Payments', {
          type: 'FOREIGN KEY',
          fields: ['payment_id'],
          references: {
            table: 'Payments', // name of Target model
            field: 'id' // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
        })
      );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Electonic_Payments');
  }
};
