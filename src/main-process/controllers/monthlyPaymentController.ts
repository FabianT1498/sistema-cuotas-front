const DB = require('./../database');
const Mensualidades = DB.Mensualidades;
const Pagos = DB.Pagos;

async function create(_mensualidad) {
  try {
    const mensualidad = Mensualidades.build(_mensualidad);
    result = await Mensualidades.create(_mensualidad);
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
    const result = await Mensualidades.findAll();
    if (result) {
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function update(_mensualidad) {
  try {
    result = await Mensualidades.update(_mensualidad, {
      where: { id_mensualidad: _mensualidad.id_mensualidad }
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

async function delete_(id_mensualidad) {
  try {
    const result = await Mensualidades.destroy({
      where: {
        id_mensualidad: id_mensualidad
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
  console.log(_mensualidad);
}

async function Pagar(data) {
  const pago = (result = await Pagos.findOne({
    where: { id_pago: data['id_pago'] }
  }));
  const mensualidad = (result = await Mensualidades.findOne({
    where: { id_mensualidad: data['id_mensualidad'] }
  }));

  if (pago === null) {
    console.log('pago Not found!');
    return 0;
  } else if (mensualidad === null) {
    console.log('mensualidad Not found!');
    return 0;
  } else {
    result = pago.addMensualidades(mensualidad, {
      through: { monto: data['monto'], parte: data['parte'] }
    });
    if (result) {
      console.log('pago Exitoso');
      return result;
    } else {
      console.log('Operacion fallida');
      return 0;
    }
  }
}

async function findPagosByMensualidad(id_mensualidad) {
  try {
    const result = await Mensualidades.findOne({
      where: { id_mensualidad: id_mensualidad },
      include: Pagos
    });
    if (result) {
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function findPagosByLider(id_lider) {
  try {
    const result = await Pagos.findOne({
      where: { lideresHogarCedula: id_lider },
      include: Mensualidades
    });
    if (result) {
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

module.exports = {
  create,
  read,
  update,
  delete_,
  Pagar,
  findPagosByMensualidad,
  findPagosByLider
};
