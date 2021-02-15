export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Monthly_Payment_Year_Month extends Model {
    static associate(models) {
      this.hasMany(models.Monthly_Payment_Record, {
        foreignKey: 'monthly_payment_date'
      });
    }
  }

  Monthly_Payment_Year_Month.init(
    {
      monthly_payment_date: {
        type: DataTypes.TEXT,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false
      },
      monthly_payment_month: DataTypes.INTEGER,
      monthly_payment_year: DataTypes.INTEGER
    },
    {
      sequelize: sequelize,
      modelName: 'Monthly_Payment_Year_Month',
      tableName: 'Monthly_Payments_Years_Months',
      timestamps: false
    }
  );

  return Monthly_Payment_Year_Month;
};
