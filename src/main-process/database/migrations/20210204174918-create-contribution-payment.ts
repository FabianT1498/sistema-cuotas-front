'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Contributions_Payments', {
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
        queryInterface.addColumn('Contributions_Payments', 'contribution_id', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Contributions', // name of Target model
            key: 'id' // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        })
      )
      .then(() =>
        queryInterface.addColumn('Contributions_Payments', 'payment_id', {
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
    await queryInterface.dropTable('Contributions_Payments');
  }
};
