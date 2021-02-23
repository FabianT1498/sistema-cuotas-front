export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Repair_Payment extends Model {
    static associate(models) {}
  }

  Repair_Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      payment_id: DataTypes.INTEGER,
      repair_id: DataTypes.INTEGER,
      amount: DataTypes.FLOAT(15)
    },
    {
      sequelize: sequelize,
      modelName: 'Repair_Payment',
      tableName: 'Repairs_Payments',
      freezeTableName: true,
      timestamps: false
    }
  );

  return Repair_Payment;
};
