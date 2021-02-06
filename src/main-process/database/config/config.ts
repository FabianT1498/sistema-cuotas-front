module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './juntaComunalDB.sqlite3'
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory'
  },
  production: {
    dialect: 'sqlite',
    storage: './juntaComunalDB.sqlite3'
  }
};
