export {};
const DB = require('./../database.ts');
const Contributions = DB.contributions;
const Payments = DB.payments;

async function create(_contribution) {
  try {
    const result = await Contributions.create(_contribution);
    const data = await result.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

/* async function read(){
    try {
        const result = await Contributions.findAll();
        const data = await result.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error)
        return 0;
    }
}

async function update(_contribution){
    try {
        const result = await Contributions.update(_contribution, { where: { : _contribution.id_contribucion }})
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

async function delete_(id_contribucion){
    try {
        const result = await Contributions.destroy({
            where: {
                id_contribucion: id_contribucion
            }
        });
        if(result){console.log("Registro borrado con exito...")}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }
    console.log(_contribution)

}

async function Pagar(data){
    const pago =  result = await Pagos.findOne({ where: { id_pago : data['id_pago'] } });
    const contribution =  result = await Contributions.findOne({ where: { id_contribucion : data['id_contribucion'] } });

    if (pago === null) {
        console.log('pago Not found!');
        return 0;

    } else if(contribution === null){
        console.log('contribution Not found!');
        return 0;

    } else {
        result = pago.addContribuciones(contribution, { through: { monto: data['monto'] } });
        if (result) {
            console.log('Operacion Exitosa');
            return pago;
        }else{
            console.log('Operacion fallida');
            return 0;
        }

    }
}

async function findPagosByContribucion(id_contribucion){
    try {
        const result = await Contributions.findOne({ where: {id_contribucion: id_contribucion}, include : Pagos});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function findPagosByLider(id_lider){
    try {
        const result = await Pagos.findOne({ where: {lideresHogarCedula: id_lider}, include : Contributions});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

} */

/* module.exports = {create, read, update, delete_,Pagar,findPagosByLider,findPagosByContribucion} */
