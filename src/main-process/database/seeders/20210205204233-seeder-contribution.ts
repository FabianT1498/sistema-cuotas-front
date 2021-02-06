'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Contributions', [
      { title: 'Apoyo a los visitantes' },
      { title: 'Aguinaldo' },
      { title: 'Incentivo para comprar el agua' },
      { title: 'Incentivo para pagar el transporte de los vigilantes' },
      { title: 'Apoyo para la limpieza de la maleza' },
      { title: 'Apoyo para la junta comunal' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Contributions', null, {});
  }
};
