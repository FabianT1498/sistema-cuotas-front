export {};

const models = require('../database/models/index');

/* const hogaresController = require('./hogaresController'); */

const Neighbor = models.Neighbor;

async function findByDNI(dni) {
  try {
    const neighbor = await Neighbor.findOne({ where: { dni } });
    return {
      status: 1,
      message: neighbor ? 'Vecino encontrado' : 'Vecino no encontrado',
      data: neighbor ? neighbor.dataValues : null
    };
  } catch (error) {
    return {
      status: 0,
      message: 'Ha ocurrido un error durante la operacion',
      data: error
    };
  }
}

/* async function create(_lider_hogar){
    try {
        const lideres_hogar = Lideres_hogar.build(_lider_hogar);
        result = await Lideres_hogar.create(_lider_hogar);
        if(result){
            console.log("Registro guardado con exito...")
            console.log(result)
        }
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function read(){
    try {
        const result = await Lideres_hogar.findAll({include : Hogares});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function findById(id){
    try {
        const lider = (await Lideres_hogar.findOne({ where: { cedula: id }, include : Hogares}));
        if(lider!== null){
            console.log(lider)
            return lider;
        }else {
            console.log("lider no encontrado")
            return 0
        }
        
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function update(_lider_hogar){
    try {
        result = await Lideres_hogar.update(_lider_hogar,{ where: { cedula: _lider_hogar.cedula }})
        if(result){
            console.log("Registro actualizado con exito...")
            console.log(result)
        }
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function delete_(cedula){
    try {
        const result = await Lideres_hogar.destroy({
            where: {
                cedula: cedula
            }
        });
        if(result){console.log("Registro borrado con exito...")}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }
    //console.log(result);

}

async function asignarHogar(data){
    const lider_hogar =  result = await Lideres_hogar.findOne({ where: { cedula: data['id_lider'] } });
    const hogar =  result = await Hogares.findOne({ where: { nro_casa: data['id_hogar'] } });

    if (lider_hogar === null) {
        console.log('Lider Not found!');
        return 0;

    } else if(hogar === null){
        console.log('Hogar Not found!');
        return 0;

    } else {
        result = hogar.setLideres_hogar(lider_hogar);
        if (result) {
            console.log('asignacion Exitosa');
            return hogar;
        }else{
            console.log('Operacion fallida');
            return 0;
        }

    }
} */

/* module.exports = {create, read, update, delete_,asignarHogar,findById} */
module.exports = { findByDNI };
