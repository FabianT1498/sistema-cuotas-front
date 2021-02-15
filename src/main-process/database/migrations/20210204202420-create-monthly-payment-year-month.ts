'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Monthly_Payments_Years_Months', {
        monthly_payment_date: {
          type: Sequelize.TEXT,
          primaryKey: true,
          autoIncrement: false,
          allowNull: false
        },
        monthly_payment_month: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        monthly_payment_year: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      })
      .then(() =>
        queryInterface.addIndex('Monthly_Payments_Years_Months', {
          fields: ['monthly_payment_month', 'monthly_payment_year'],
          unique: true
        })
      );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Monthly_Payments_Years_Months');
  }
};
