export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contribution_Payment extends Model {
    static associate(models) {}
  }

  Contribution_Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      amount: DataTypes.FLOAT(15),
      payment_id: DataTypes.INTEGER,
      contribution_id: DataTypes.INTEGER
    },
    {
      sequelize: sequelize,
      modelName: 'Contribution_Payment',
      tableName: 'Contributions_Payments',
      freezeTableName: true,
      timestamps: false
    }
  );

  return Contribution_Payment;
};
