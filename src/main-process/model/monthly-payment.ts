module.exports = (sequelize, DataTypes) => {
  const Monthly_Payment = sequelize.define('monthly_payments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    month: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    year: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    cost: {
      type: DataTypes.REAL,
      allowNull: false
    }
  });

  Monthly_Payment.associate = function(db) {
    this.belongsToMany(db.payments, {
      through: db.monthly_payments_record,
      foreignKey: 'monthly_payment_id',
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL'
    });
  };

  return Monthly_Payment;
};
