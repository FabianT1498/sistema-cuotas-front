export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Neighbor extends Model {
    static associate(models) {
      this.belongsTo(models.House, {
        foreignKey: 'house_no'
      });
      this.hasMany(models.Payment);
    }
  }

  Neighbor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      dni: DataTypes.STRING(10),
      fullname: DataTypes.STRING,
      phone_number: DataTypes.STRING(20),
      email_address: DataTypes.STRING
    },
    {
      sequelize: sequelize,
      modelName: 'Neighbor',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Neighbor;
};
