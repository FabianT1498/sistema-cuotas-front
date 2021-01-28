module.exports = (sequelize, DataTypes) => {
  const Monthly_Payment_Record = sequelize.define(
    'monthly_payments_record',
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

  return Monthly_Payment_Record;
};
