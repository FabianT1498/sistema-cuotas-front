'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Monthly_Payments_Record', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        amount: {
          type: Sequelize.FLOAT(15),
          allowNull: false
        }
      })
      .then(() =>
        queryInterface.addColumn(
          'Monthly_Payments_Record',
          'monthly_payment_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'Monthly_Payments', // name of Target model
              key: 'id' // key in Target model that we're referencing
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          }
        )
      )
      .then(() =>
        queryInterface.addColumn('Monthly_Payments_Record', 'payment_id', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Payments', // name of Target model
            key: 'id' // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        })
      );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Monthly_Payments_Record');
  }
};
