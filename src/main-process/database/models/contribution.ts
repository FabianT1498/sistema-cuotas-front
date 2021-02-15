const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contribution extends Model {
    static associate(models) {
      this.belongsToMany(models.Payment, {
        through: 'Contributions_Payments',
        foreignKey: 'contribution_id'
      });
    }
  }

  Contribution.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: DataTypes.TEXT
    },
    {
      sequelize: sequelize,
      modelName: 'Contribution',
      tableName: 'Contributions',
      timestamps: false
    }
  );

  return Contribution;
};
