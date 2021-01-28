module.exports = (sequelize, DataTypes) => {
  const Neighbor = sequelize.define('neighbors', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    dni: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    email_address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });

  Neighbor.associate = function(db) {
    this.belongsTo(db.houses);

    this.hasMany(db.payments);
  };

  return Neighbor;
};
