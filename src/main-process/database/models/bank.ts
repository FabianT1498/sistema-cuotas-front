export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    static associate(models) {
      this.hasMany(models.Electronic_Payment);
    }
  }

  Bank.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      name: DataTypes.TEXT
    },
    {
      sequelize: sequelize,
      modelName: 'Bank'
    }
  );

  return Bank;
};
