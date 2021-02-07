'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('Neighbors', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        dni: {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: true
        },
        fullname: {
          type: Sequelize.STRING,
          allowNull: false
        },
        phone_number: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true
        },
        email_address: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        created_at: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.TEXT,
          allowNull: false
        }
      })
      .then(() =>
        queryInterface.addColumn('Neighbors', 'house_no', {
          type: Sequelize.STRING(10),
          references: {
            model: 'Houses', // name of Target model
            key: 'house_no' // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Neighbors');
  }
};
