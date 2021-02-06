export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class House extends Model {
    static associate(models) {
      this.hasOne(models.Neighbor);
    }
  }

  House.init(
    {
      house_no: {
        type: DataTypes.STRING(10),
        primaryKey: true
      },
      street: DataTypes.STRING(50)
    },
    {
      sequelize: sequelize,
      modelName: 'House'
    }
  );

  return House;
};
