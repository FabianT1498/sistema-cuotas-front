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
        primaryKey: true
      },
      title: DataTypes.TEXT
    },
    {
      sequelize: sequelize,
      modelName: 'Contribution',
      timestamps: false
    }
  );

  return Contribution;
};
