export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Monthly_Payment extends Model {
    static associate(models) {
      this.belongsToMany(models.Payment, {
        through: 'Monthly_Payments_Record'
      });
    }
  }

  Monthly_Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      month: DataTypes.STRING(15),
      year: DataTypes.STRING(4),
      cost: DataTypes.REAL
    },
    {
      sequelize: sequelize,
      modelName: 'Monthly_Payment'
    }
  );

  return Monthly_Payment;
};
