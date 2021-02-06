const DB = require('../database');
const Reparaciones = DB.Reparaciones;
const Pagos = DB.Pagos;

async function create(_reparacion) {
  try {
    const reparacion = Reparaciones.build(_reparacion);
    result = await Reparaciones.create(_reparacion);
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
    const result = await Reparaciones.findAll();
    if (result) {
      console.log(result);
    }
    return result;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function update(_reparacion) {
  try {
    result = await Reparaciones.update(_reparacion, {
      where: { id_reparacion: _reparacion.id_reparacion }
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

async function delete_(id_reparacion) {
  try {
    const result = await Reparaciones.destroy({
      where: {
        id_reparacion: id_reparacion
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
  console.log(_reparacion);
}

async function Pagar(data) {
  const pago = (result = await Pagos.findOne({
    where: { id_pago: data['id_pago'] }
  }));
  const reparacion = (result = await Reparaciones.findOne({
    where: { id_reparacion: data['id_reparacion'] }
  }));

  if (pago === null) {
    console.log('pago Not found!');
    return 0;
  } else if (reparacion === null) {
    console.log('reparacion Not found!');
    return 0;
  } else {
    result = pago.addReparaciones(reparacion, {
      through: { monto: data['monto'] }
    });
    if (result) {
      console.log('Operacion Exitosa');
      return pago;
    } else {
      console.log('Operacion fallida');
      return 0;
    }
  }
}

async function findPagosByReparacion(id_reparacion) {
  try {
    const result = await Reparaciones.findOne({
      where: { id_reparacion: id_reparacion },
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
      include: Reparaciones
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
  findPagosByLider,
  findPagosByReparacion
};
