export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Repair extends Model {
    static associate(models) {
      this.belongsToMany(models.Payment, {
        through: 'Repairs_Payments'
      });
    }
  }

  Repair.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      title: DataTypes.STRING(100),
      description: DataTypes.TEXT,
      issue_date: DataTypes.TEXT,
      cost: DataTypes.REAL
    },
    {
      sequelize: sequelize,
      modelName: 'Repair'
    }
  );

  return Repair;
};
