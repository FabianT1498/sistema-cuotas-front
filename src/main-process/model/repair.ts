module.exports = (sequelize, DataTypes) => {
  const Reparation = sequelize.define('repairs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    issue_date: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cost: {
      type: DataTypes.REAL,
      allowNull: false
    }
  });

  Reparation.associate = function(db) {
    this.belongsToMany(db.payments, {
      through: db.repairs_payments,
      foreignKey: 'repair_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  };

  return Reparation;
};
