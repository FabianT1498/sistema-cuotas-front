module.exports = (sequelize, DataTypes) => {
  const Contribution_Payment = sequelize.define(
    'contributions_payments',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      amount: {
        type: DataTypes.FLOAT(15),
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  );

  return Contribution_Payment;
};
