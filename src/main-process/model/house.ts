module.exports = (sequelize, DataTypes) => {
  const House = sequelize.define('houses', {
    house_no: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  });

  House.associate = function(db) {
    this.hasOne(db.neighbors, {
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      foreignKey: 'house_no'
    });
  };

  return House;
};
