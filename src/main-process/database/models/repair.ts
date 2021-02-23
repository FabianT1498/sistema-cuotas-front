export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Repair extends Model {
    static associate(models) {
      this.belongsToMany(models.Payment, {
        through: {
          model: models.Repair_Payment
        },
        foreignKey: 'repair_id',
        otherKey: 'payment_id'
      });
    }
  }

  Repair.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: DataTypes.STRING(100),
      description: DataTypes.TEXT,
      issue_date: DataTypes.TEXT,
      cost: DataTypes.REAL
    },
    {
      sequelize: sequelize,
      modelName: 'Repair',
      tableName: 'Repairs',
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Repair;
};
