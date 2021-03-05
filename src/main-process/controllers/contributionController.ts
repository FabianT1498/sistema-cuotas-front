export {};
const models = require('../database/models/index');

const Contribution = models.Contribution;

const response = {
  status: 1,
  message: '',
  data: null
};

async function getAll() {
  try {
    const result = await Contribution.findAll();

    const data = result.map(el => {
      return {
        id: el.id,
        title: el.title
      };
    });

    response.status = 1;
    response.message =
      data.length > 0
        ? 'Contribuciones encontradas'
        : 'No hay contribuciones registradas';
    response.data = data;
    return response;
  } catch (error) {
    response.status = 0;
    response.message = 'Ocurrio un error al procesar las contribuciones';
    return response;
  }
}

module.exports = { getAll };
