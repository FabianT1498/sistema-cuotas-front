export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Monthly_Payment_Cost extends Model {
    static associate(models) {}
  }

  Monthly_Payment_Cost.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cost: DataTypes.FLOAT(15)
    },
    {
      sequelize: sequelize,
      modelName: 'Monthly_Payment_Cost',
      tableName: 'Monthly_Payments_Costs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Monthly_Payment_Cost;
};
