export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      this.belongsTo(models.Neighbor, {
        foreignKey: 'neighbor_id'
      });

      this.hasOne(models.Electronic_Payment, {
        foreignKey: 'payment_id'
      });

      this.hasMany(models.Monthly_Payment_Record, {
        foreignKey: 'payment_id'
      });

      this.belongsToMany(models.Contribution, {
        through: models.Contribution_Payment,
        foreignKey: 'payment_id'
      });

      this.belongsToMany(models.Repair, {
        through: {
          model: models.Repair_Payment
        },
        foreignKey: 'payment_id',
        otherKey: 'repair_id'
      });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      amount: DataTypes.REAL,
      payment_date: DataTypes.TEXT,
      payment_method: DataTypes.TEXT
    },
    {
      sequelize: sequelize,
      modelName: 'Payment',
      tableName: 'Payments',
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Payment;
};
