export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Electronic_Payment extends Model {
    static associate(models) {
      this.belongsTo(models.Payment);
      this.belongsTo(models.Bank, {
        foreignKey: 'bank_id'
      });
    }
  }

  Electronic_Payment.init(
    {
      payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      reference_number: DataTypes.STRING,
      bank_id: DataTypes.INTEGER
    },
    {
      sequelize: sequelize,
      modelName: 'Electronic_Payment',
      timestamps: false
    }
  );

  return Electronic_Payment;
};
