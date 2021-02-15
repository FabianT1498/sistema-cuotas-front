export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Monthly_Payment_Record extends Model {
    static associate(models) {
      this.belongsTo(models.Payment, {
        foreignKey: 'payment_id'
      });

      this.belongsTo(models.Monthly_Payment_Year_Month, {
        foreignKey: 'monthly_payment_date'
      });
    }
  }

  Monthly_Payment_Record.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      amount: DataTypes.FLOAT(15)
    },
    {
      sequelize: sequelize,
      modelName: 'Monthly_Payment_Record',
      tableName: 'Monthly_Payments_Record',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Monthly_Payment_Record;
};
