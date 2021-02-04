module.exports = (sequelize, DataTypes) => {
  const Electronic_Payment = sequelize.define(
    'electronic_payments',
    {
      payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      reference_number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      bank: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['reference_number', 'bank']
        }
      ]
    }
  );

  Electronic_Payment.associate = function(db) {
    this.belongsTo(db.payments);
  };

  return Electronic_Payment;
};
