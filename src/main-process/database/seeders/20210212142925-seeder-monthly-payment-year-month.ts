'use strict';

const formatDateISO = require('./../../helpers/format_date_ISO.ts');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = [];
    const amount = 24;
    const date = new Date();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    for (let i = 0; i < amount; i++) {
      data.push({
        monthly_payment_date: formatDateISO.formatDateISO(1, month, year),
        monthly_payment_year: year,
        monthly_payment_month: month
      });

      if (month % 12 === 0) {
        year++;
        month = 1;
      } else {
        month++;
      }
    }

    return queryInterface.bulkInsert('Monthly_Payments_Years_Months', data);
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
