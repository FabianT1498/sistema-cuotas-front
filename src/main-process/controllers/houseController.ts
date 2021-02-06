const DB = require('../database');
const Hogares = DB.Hogares;
const Lideres_hogar = DB.Lideres_hogar;

async function create(_hogar) {
  try {
    const hogar = Hogares.build(_hogar);
    result = await Hogares.create(_hogar);
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
    const result = await Hogares.findAll({ include: Lideres_hogar });
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
    const hogar = await Hogares.findOne({
      where: { nro_casa: id },
      include: Lideres_hogar
    });
    if (hogar !== null) {
      console.log(hogar);
      return hogar;
    } else {
      console.log('hogar no encontrado');
      return result;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function update(_hogar) {
  try {
    result = await Hogares.update(_hogar, {
      where: { nro_casa: _hogar.nro_casa }
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

async function delete_(nro_casa) {
  try {
    const result = await Hogares.destroy({
      where: {
        nro_casa: nro_casa
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
  console.log(_hogar);
}

module.exports = { create, read, update, delete_, findById };
