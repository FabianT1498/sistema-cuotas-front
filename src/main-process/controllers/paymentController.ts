import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

export {};

const Sequelize = require('sequelize');

const models = require('../database/models/index');

const paginate = require('../helpers/paginate');

const Payment = models.Payment;
const Neighbor = models.Neighbor;
const House = models.House;
const Electronic_Payment = models.Electronic_Payment;
const Bank = models.Bank;

async function getPaymentsCount() {
  try {
    const result = await Payment.count();
    console.log(result);
    return { status: '1', message: 'Total de pagos', data: result };
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error',
      data: error
    };
  }
}

async function getPayments(neighborID, searchCriterias, searchOptions) {
  try {
    const Op = Sequelize.Op;

    const pageIndex = searchOptions.pageIndex;
    const pageSize = searchOptions.pageSize;

    const neighborJoin = {
      model: Neighbor,
      attributes: [['fullname', 'neighbor_fullname']],
      required: true
    };

    const electronicPaymentJoin = {
      model: Electronic_Payment,
      attributes: ['reference_number'],
      required: false,
      include: [
        {
          model: Bank,
          attributes: ['name'],
          required: false
        }
      ]
    };

    const whereNeighbors = {};
    const wherePayments = {};
    const whereElectronicPayment = {};

    // Neighbor search criterias
    if (neighborID !== -1) {
      whereNeighbors['id'] = neighborID;
    }

    if (searchCriterias.neighborDNI !== '') {
      whereNeighbors['dni'] = searchCriterias.neighborDNI;
    }

    // Payment search criterias
    if (
      searchCriterias.paymentStartDate &&
      searchCriterias.paymentStartDate !== '' &&
      !searchCriterias.paymentEndDate
    ) {
      wherePayments['payment_date'] = {
        [Op.eq]: searchCriterias.paymentStartDate
      };
    } else if (
      searchCriterias.paymentStartDate &&
      searchCriterias.paymentStartDate !== '' &&
      searchCriterias.paymentEndDate !== ''
    ) {
      wherePayments['payment_date'] = {
        [Op.between]: [
          searchCriterias.paymentStartDate,
          searchCriterias.paymentEndDate
        ]
      };
    }

    if (searchCriterias.paymentMethod !== 'Todos') {
      wherePayments['payment_method'] = {
        [Op.eq]: [searchCriterias.paymentMethod]
      };
    }

    // Electronic Payment search criterias
    if (searchCriterias.paymentBank !== -1) {
      whereElectronicPayment['bank_id'] = {
        [Op.eq]: [parseInt(searchCriterias.paymentBank, 10)]
      };
    }

    if (searchCriterias.referenceNumber !== '') {
      whereElectronicPayment['reference_number'] = {
        [Op.eq]: [searchCriterias.referenceNumber]
      };
    }

    const options = {
      attributes: ['id', 'payment_method', 'payment_date', 'amount'],
      include: [neighborJoin],
      ...paginate.paginate({ pageIndex, pageSize })
    };

    if (searchCriterias.paymentMethod === 'Todos') {
      options['include'].push(electronicPaymentJoin);
    } else if (
      searchCriterias.paymentMethod === 'Pago movil' ||
      searchCriterias.paymentMethod === 'Transferencia'
    ) {
      electronicPaymentJoin.required = true;
      options['include'].push(electronicPaymentJoin);
    }

    if (Object.keys(whereNeighbors).length > 0) {
      options['include'][0]['where'] = whereNeighbors;
    }

    if (Object.keys(whereElectronicPayment).length > 0) {
      options['include'][1]['where'] = whereElectronicPayment;
    }

    if (Object.keys(wherePayments).length > 0) {
      options['where'] = wherePayments;
    }

    const result = await Payment.findAll(options);

    console.log(result);

    return {
      status: '1',
      message: 'Pagos encontrados',
      data: result.map(el => {
        return {
          id: el.id,
          neighborID: neighborID,
          paymentDate: el.payment_date,
          amount: el.amount,
          paymentMethod: el.payment_method,
          referenceNumber: el.Electronic_Payment
            ? el.Electronic_Payment.dataValues.reference_number
            : '',
          bank: el.Electronic_Payment
            ? el.Electronic_Payment.Bank.dataValues.name
            : '',
          neighborFullName: el.Neighbor
            ? el.Neighbor.dataValues.neighbor_fullname
            : ''
        };
      })
    };
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error durante la recuperación de los pagos',
      data: error
    };
  }
}

async function create(_payment, _neighbor) {
  console.log(`Payment: ${_payment}`);
  console.log(`Neigbor: ${_neighbor}`);

  try {
    let neighbor = null;

    // Vecino no esta registrado
    if (_neighbor['neighborID'] === -1) {
      await House.create({
        house_no: _neighbor.houseNumber,
        street: 'Calle finlandia'
      });

      neighbor = await Neighbor.create({
        dni: _neighbor.neighborDNI,
        fullname: _neighbor.fullName,
        phone_number: _neighbor.phoneNumber,
        email_address: _neighbor.email,
        house_no: _neighbor.houseNumber
      });
    } else {
      neighbor = await Neighbor.findOne({
        where: { id: _neighbor['neighborID'] }
      });
    }

    console.log(neighbor);

    if (neighbor) {
      const payment = await Payment.create({
        payment_date: _payment.paymentDate,
        payment_method: _payment.paymentMethod,
        amount: _payment.amount,
        neighbor_id: neighbor.getDataValue('id')
      });

      if (payment) {
        /** Pago electronico */
        if (_payment.paymentMethod !== 'Efectivo') {
          const electronicPayment = await Electronic_Payment.create({
            payment_id: payment.dataValues.id,
            bank_id: _payment['bank'] ? _payment['bank'] : null,
            reference_number: _payment['referenceNumber']
              ? _payment['referenceNumber']
              : ''
          });

          if (!electronicPayment) {
            await Payment.destroy({ where: { id: payment.dataValues.id } });
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
    console.error(error);
    return {
      status: '0',
      message: 'ha ocurrido un error durante el registro en la base de datos',
      data: error
    };
  }
}

/* async function read(){
    try {
        const result = await Payment.findAll({include : Electronic_Payment});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

}

async function update(_payment){
    try {
        result = await Payment.update(_payment,{ where: { id_pago: _payment.id_pago }})
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
        const result = await Payment.destroy({
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
        const payment = (await Payment.findOne({ where: { id_pago: id }, include : Electronic_Payment}));
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
        const result = await Payment.findAll({ where: {lideresHogarCedula: id_lider}, include : Electronic_Payment});
        if(result){console.log(result)}
        return result
    } catch (error) {
        console.log(error)
        return 0;
    }

} */

/* module.exports = {create, read, update, delete_,findById,findByLider} */
module.exports = { getPayments, create, getPaymentsCount };

/* Executing (default): SELECT `Payment`.`id`, `Payment`.`payment_method`, `Payment`.`payment_date`, `Payment`.`amount`,
`Neighbor`.`id` AS `Neighbor.id`, `Neighbor`.`fullname` AS `Neighbor.neighbor_fullname`,
 `Electronic_Payment`.`payment_id` AS `Electronic_Payment.payment_id`, `Electronic_Payment`.`reference_number` 
 AS `Electronic_Payment.reference_number`, `Electronic_Payment->Bank`.`id` AS `Electronic_Payment.Bank.id`, `Electronic_Payment->Bank`.`name` 
 AS `Electronic_Payment.Bank.name` FROM `Payments` AS `Payment` INNER JOIN `Neighbors` AS `Neighbor` 
 ON `Payment`.`neighbor_id` = `Neighbor`.`id` LEFT OUTER JOIN ( `Electronic_Payments` AS `Electronic_Payment` 
 INNER JOIN `Banks` AS `Electronic_Payment->Bank` 
 ON `Electronic_Payment`.`bank_id` = `Electronic_Payment->Bank`.`id` ) ON `Payment`.`id` = `Electronic_Payment`.`payment_id` 
 AND `Electronic_Payment`.`bank_id` = '3' WHERE `Payment`.`payment_method` = 'Pago movil' LIMIT 0, 5;
 */
