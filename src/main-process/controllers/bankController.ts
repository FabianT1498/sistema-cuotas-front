export {};

const models = require('../database/models/index');
const Bank = models.Bank;

async function getBanks() {
  try {
    const result = await Bank.findAll();

    return {
      status: '1',
      message: 'Bancos encontrados',
      data: result.map(el => el.dataValues)
    };
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error durante la recuperación de los bancos',
      data: error
    };
  }
}

/* module.exports = {create, read, update, delete_,findById,findByLider} */
module.exports = { getBanks };
