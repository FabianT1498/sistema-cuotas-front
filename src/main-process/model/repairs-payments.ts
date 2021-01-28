module.exports = (sequelize, DataTypes) => {
  const Repair_Payment = sequelize.define(
    'repairs_payments',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      amount: {
        type: DataTypes.REAL,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  );

  return Repair_Payment;
};
