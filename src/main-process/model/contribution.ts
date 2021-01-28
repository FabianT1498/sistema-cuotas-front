module.exports = (sequelize, DataTypes) => {
  const Contribution = sequelize.define(
    'contributions',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  );

  Contribution.associate = function(db) {
    this.belongsToMany(db.payments, {
      through: db.contributions_payments,
      foreignKey: 'contribution_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  };

  return Contribution;
};
