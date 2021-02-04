module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('payments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    amount: {
      type: DataTypes.REAL,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  Payment.associate = function(db) {
    this.belongsTo(db.neighbors, {
      foreignKey: 'neighbor_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.hasOne(db.electronic_payments, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      foreignKey: 'payment_id'
    });

    this.belongsToMany(db.monthly_payments, {
      through: db.monthly_payments_record,
      foreignKey: 'payment_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.belongsToMany(db.contributions, {
      through: db.contributions_payments,
      foreignKey: 'payment_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.belongsToMany(db.repairs, {
      through: db.repairs_payments,
      foreignKey: 'payment_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  };

  return Payment;
};
