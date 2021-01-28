const DB = require('../database');
const hogaresController = require('./hogaresController');
const Pagos = DB.Pagos;
const Lideres_hogar = DB.Lideres_hogar;
const Pagos_electronicos = DB.Pagos_electronicos;

async function create(_pago_electronico) {
  try {
    result = await Pagos_electronicos.create(_pago_electronico);
    if (result) {
      console.log('Registro guardado con exito...');
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function read() {
  try {
    const result = await Pagos_electronicos.findAll({ include: Pagos });
    if (result) {
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function findById(id) {
  try {
    const pago = await Pagos_electronicos.findOne({
      where: { pagoIdPago: id },
      include: Pagos
    });
    if (lider !== null) {
      console.log(pago);
      return pago;
    } else {
      console.log('lider no encontrado');
      return 0;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function update(_pago_electronico) {
  try {
    result = await Pagos_electronicos.update(_pago_electronico, {
      where: { nro_referencia: _pago_electronico['nro_referencia'] }
    });
    if (result) {
      console.log('Registro actualizado con exito...');
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function delete_(nro_referencia) {
  try {
    const result = await Pagos_electronicos.destroy({
      where: {
        nro_referencia: nro_referencia
      }
    });
    if (result) {
      console.log('Registro borrado con exito...');
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
  //console.log(result);
}

module.exports = { create, read, update, delete_, findById };
