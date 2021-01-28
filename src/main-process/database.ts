const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${__dirname}/juntaComunalDB.sqlite`
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

const db: any = {};
db.houses = require('./model/house.ts')(sequelize, Sequelize);
db.neighbors = require('./model/neighbor.ts')(sequelize, Sequelize);
db.payments = require('./model/payment.ts')(sequelize, Sequelize);
db.electronic_payments = require('./model/electronic-payment.ts')(
  sequelize,
  Sequelize
);
db.monthly_payments = require('./model/monthly-payment.ts')(
  sequelize,
  Sequelize
);
db.repairs = require('./model/repair.ts')(sequelize, Sequelize);
db.contributions = require('./model/contribution.ts')(sequelize, Sequelize);
db.monthly_payments_record = require('./model/monthly-payments-record.ts')(
  sequelize,
  Sequelize
);
db.repairs_payments = require('./model/repairs-payments.ts')(
  sequelize,
  Sequelize
);
db.contributions_payments = require('./model/contributions-payments.ts')(
  sequelize,
  Sequelize
);

db.houses.associate(db);
db.neighbors.associate(db);
db.payments.associate(db);
db.electronic_payments.associate(db);
db.monthly_payments.associate(db);
db.repairs.associate(db);
db.contributions.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
