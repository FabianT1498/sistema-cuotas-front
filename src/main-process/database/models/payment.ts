export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      this.belongsTo(models.Neighbor);

      this.hasOne(models.Electronic_Payment);

      this.belongsToMany(models.Monthly_Payment, {
        through: 'Monthly_Payments_Record'
      });

      this.belongsToMany(models.Contribution, {
        through: 'Contributions_Payments'
      });

      this.belongsToMany(models.Repair, {
        through: 'Repairs_Payments'
      });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      amount: DataTypes.REAL,
      payment_date: DataTypes.TEXT,
      payment_method: DataTypes.TEXT
    },
    {
      sequelize: sequelize,
      modelName: 'Payment'
    }
  );

  return Payment;
};
