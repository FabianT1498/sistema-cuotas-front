'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Banks', [
      { name: 'Banco de Venezuela' },
      { name: 'Bancaribe' },
      { name: 'Banco provincial' },
      { name: 'Banco Bicentenario' },
      { name: 'Banco del Tesoro' },
      { name: 'Banco Venezolano de Crédito' },
      { name: 'Banesco' },
      { name: 'Banfoandes' },
      { name: 'Banplus' },
      { name: 'Casa Propia' },
      { name: 'Banco Central de Venezuela' },
      { name: 'Banco Mercantil' },
      { name: 'Banco Provincial' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Banks', null, {});
  }
};
