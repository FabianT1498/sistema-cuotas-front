export {};
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Neighbor extends Model {
    static associate(models) {
      this.belongsTo(models.House);
      this.hasMany(models.Payment);
    }
  }

  Neighbor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      dni: DataTypes.STRING(10),
      fullname: DataTypes.STRING,
      phone_number: DataTypes.STRING(20),
      email_address: DataTypes.STRING
    },
    {
      sequelize: sequelize,
      modelName: 'Neighbor'
    }
  );

  return Neighbor;
};
