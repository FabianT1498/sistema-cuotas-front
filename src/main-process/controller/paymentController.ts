export {};
const DB = require('./../database');

const Payments = DB.payments;
const Neighbors = DB.neighbors;
const Houses = DB.houses;
const Electronic_Payments = DB.electronic_payments;

async function create(_payment, _neighbor) {
  console.log(`Payment: ${_payment}`);
  console.log(`Neigbor: ${_neighbor}`);

  try {
    let neighbor = null;

    // Vecino no esta registrado
    if (_neighbor['neighborID'] === -1) {
      await Houses.create({
        house_no: _neighbor.houseNumber,
        street: 'Calle finlandia'
      });

      neighbor = await Neighbors.create({
        dni: _neighbor.neighborDNI,
        fullname: _neighbor.fullName,
        phone_number: _neighbor.phoneNumber,
        email_address: _neighbor.email,
        house_no: _neighbor.houseNumber
      });
    } else {
      neighbor = await Neighbors.findOne({
        where: { id: _neighbor['neighborID'] }
      });
    }

    if (neighbor) {
      const payment = await Payments.create({
        payment_date: _payment.paymentDate,
        payment_method: _payment.paymentMethod,
        amount: _payment.amount,
        neighbor_id: neighbor.dataValues.id
      });

      if (payment) {
        /** Pago electronico */
        if (parseInt(_payment.paymentMethod) !== 0) {
          const electronicPayment = await Electronic_Payments.create({
            payment_id: payment.dataValues.id,
            bank: _payment['bank'] ? _payment['bank'] : '',
            reference_number: _payment['referenceNumber']
              ? _payment['referenceNumber']
              : ''
          });

          if (!electronicPayment) {
            await Payments.destroy({ where: { id: payment.dataValues.id } });
            return {
              status: '0',
              message: 'El registro del pago electronico ha fallado',
              data: {}
            };
          }
        }

        return {
          status: '1',
          message: 'Pago registrado con exito',
          data: payment.dataValues
        };
      } else {
        console.log('Registro de pago fallido');
        return {
          status: '0',
          message: 'El registro del pago ha fallado',
          data: {}
        };
      }
    } else {
      return { status: '0', message: 'Este vecino no existe', data: {} };
    }
  } catch (error) {
    return {
      status: '0',
      message: 'ha ocurrido un error durante el registro en la base de datos',
      data: error
    };
  }
}

/* async function read(){
    try {
        const result = await Payments.findAll({include : Electronic_Payments});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function update(_payment){
    try {
        result = await Payments.update(_payment,{ where: { id_pago: _payment.id_pago }})
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

async function delete_(id_pago){
    try {
        const result = await Payments.destroy({
            where: {
                id_pago: id_pago
            }
        });
        if(result){console.log("Registro borrado con exito...")}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }
    console.log(_payment)

}

async function findById(id){
    try {
        const payment = (await Payments.findOne({ where: { id_pago: id }, include : Electronic_Payments}));
        if(payment!== null){
            console.log(payment)
            return payment;
        }else {
            console.log("payment no encontrado")
            return 0
        }
        
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function findByLider(id_lider){
    try {
        const result = await Payments.findAll({ where: {lideresHogarCedula: id_lider}, include : Electronic_Payments});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

} */

/* module.exports = {create, read, update, delete_,findById,findByLider} */
module.exports = { create };
