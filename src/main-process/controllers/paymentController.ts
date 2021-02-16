export {};

const Sequelize = require('sequelize');

var moment = require('moment');

const models = require('../database/models/index');

const paginate = require('../helpers/paginate');

const Payment = models.Payment;
const Neighbor = models.Neighbor;
const House = models.House;
const Electronic_Payment = models.Electronic_Payment;
const Bank = models.Bank;

const Monthly_Payment_Record = models.Monthly_Payment_Record;
const Monthly_Payment_Cost = models.Monthly_Payment_Cost;
const Monthly_Payment_Year_Month = models.Monthly_Payment_Year_Month;
const Repair = models.Repair;
const Contribution = models.Contribution;

const Op = Sequelize.Op;

const response = {
  status: 1,
  message: '',
  data: {}
};

async function monthlyPaymentsExists(
  monthly_payments: any[]
): Promise<boolean> {
  if (monthly_payments.length === 0) {
    return true;
  }

  const monthly_payments_ids = monthly_payments.map(el => {
    return {
      monthly_payment_date: el.id
    };
  });

  const monthly_payments_count = await Monthly_Payment_Year_Month.count({
    where: {
      [Op.or]: monthly_payments_ids
    }
  });

  return monthly_payments_count === monthly_payments.length;
}

async function repairsExists(repairs: any[]): Promise<boolean> {
  if (repairs.length === 0) {
    return true;
  }

  const repairs_ids = repairs.map(el => {
    return {
      id: el.id
    };
  });

  const repairs_count = await Repair.count({
    where: {
      [Op.or]: repairs_ids
    }
  });

  return repairs_count === repairs.length;
}

async function contributionsExists(contributions: any[]): Promise<boolean> {
  if (contributions.length === 0) {
    return true;
  }

  const contributions_ids = contributions.map(el => {
    return {
      id: el.id
    };
  });

  const contributions_count = await Repair.count({
    where: {
      [Op.or]: contributions_ids
    }
  });

  return contributions_count === contributions.length;
}

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
  try {
    // 1. Verificar que existan las mensualidades
    const all_monthly_payments_exists = await monthlyPaymentsExists(
      _payment.monthlyPayments
    );

    if (!all_monthly_payments_exists) {
      response.message = 'Hay mensualidades que no existen';
      return response;
    }

    // 2. Verificar que existan las reparaciones
    const all_repairs_exists = await repairsExists(_payment.repairs);

    if (!all_repairs_exists) {
      response.message = 'Hay reparaciones que no existen';
      return response;
    }

    // 3. Verificar que existan las contribuciones
    const all_contributions_exists = await contributionsExists(
      _payment.contributions
    );

    if (!all_contributions_exists) {
      response.message = 'Hay contribuciones que no existen';
      return response;
    }

    let neighbor = null;

    if (_neighbor['neighborID'] === -1) {
      await House.create({
        house_no: _neighbor.houseNumber,
        street: 'Calle finlandia' // HARD CODE
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

    if (neighbor) {
      const total_monthly_payments_items = _payment.monthlyPayments.length;
      const total_repairs_items = _payment.repairs.length;
      const total_contributions_items = _payment.contributions.length;

      // 4. Verificar que el credito sea mayor que el debito
      let debit = 0;
      let credit = 0;

      // 4.1. Obtener el costo actual de la mensualidad
      let monthly_payments_cost = null;

      if (total_monthly_payments_items > 0) {
        monthly_payments_cost = await Monthly_Payment_Cost.findOne({
          order: [['id', 'DESC']]
        });

        debit += total_monthly_payments_items * monthly_payments_cost.cost;
      }

      // 4.2. Obtener el costo de cada reparacion por vecino
      let repairs_ids = [];
      let repairs_costs_by_neighbor = [];

      if (total_repairs_items > 0) {
        repairs_ids = _payment.repairs.map(el => {
          return { id: el.id };
        });

        repairs_costs_by_neighbor = await Repair.findAll({
          attributes: {
            include: [
              [
                // Note the wrapping parentheses in the call below!
                Sequelize.literal(`cost / (
                    SELECT COUNT(id)
                    FROM Neighbors)`),
                'cost_by_neighbor'
              ]
            ]
          },
          where: {
            [Op.or]: repairs_ids
          },
          order: [['id', 'ASC']]
        });

        console.log(repairs_costs_by_neighbor);
        debit += repairs_costs_by_neighbor.reduce(
          (accumulator, el) => accumulator + el.cost_by_neighbor,
          0
        );
      }

      // 4.3. Obtener la cantidad de dinero que se va a contribuir
      if (total_contributions_items > 0) {
        debit += _payment.contributions.reduce(
          (accumulator, el) => accumulator + el.amount,
          0
        );
      }

      console.log(`El debito es ${debit}`);

      // This is for test purposes, delete later
      const min_remainder = 500000; // HARD CODE

      let remainder = 0;
      let last_monthly_payment_paid = null;

      // 4.4. Obtener el ultimo pago de mensualidad del vecino
      if (_neighbor['neighborID'] !== -1) {
        const payment_join = {
          model: Payment,
          required: true,
          where: {
            neighbor_id: {
              [Op.eq]: [neighbor.id]
            }
          }
        };

        const options = {
          include: [payment_join],
          order: [
            ['id', 'DESC'],
            [Payment, 'id', 'DESC']
          ]
        };

        last_monthly_payment_paid = await Monthly_Payment_Record.findOne(
          options
        );

        // 4.5. Obtener el remanente del ultimo pago, si y solo si van a ser registrados nuevos pagos de mensualidad
        if (last_monthly_payment_paid && total_monthly_payments_items > 0) {
          const previous_monthly_payment_cost = await Monthly_Payment_Cost.findOne(
            {
              attributes: ['cost'],
              where: {
                created_at: {
                  [Op.lte]: [last_monthly_payment_paid.updated_at]
                }
              },
              order: [['id', 'DESC']]
            }
          );

          remainder =
            last_monthly_payment_paid.amount -
            previous_monthly_payment_cost.cost;
        }
      }

      // 4.6. Validar que el credito sea mayor que el debito
      credit = remainder + _payment.amount;

      if (credit < debit) {
        response.message = 'El debito supera al credito';
        return response;
      }

      const payment_attributes = {
        payment_date: _payment.paymentDate,
        payment_method: _payment.paymentMethod,
        amount: _payment.amount,
        neighbor_id: neighbor.getDataValue('id')
      };

      const include_models = [];

      // 5. Registrar los reparaciones pagadas
      if (total_repairs_items > 0) {
        include_models.push(Repair);
        payment_attributes['Repair'] = repairs_costs_by_neighbor.map(el => {
          credit -= el.cost_by_neighbor;
          return { repair_id: el.id, amount: el.cost_by_neighbor };
        });
      }

      // 6. Registrar las contribuciones contribuidas
      if (total_contributions_items > 0) {
        include_models.push(Contribution);
        payment_attributes['Contribution'] = _payment.contributions.map(el => {
          credit -= el.amount;
          return { contribution_id: el.id, amount: el.amount };
        });
      }

      // 7. Registrar las mensualidades pagadas
      if (total_monthly_payments_items > 0) {
        include_models.push(Monthly_Payment_Record);
        credit -= _payment.monthlyPayments.length * monthly_payments_cost;
        payment_attributes[
          'Monthly_Payments_Record'
        ] = _payment.monthlyPayments.map(el => {
          return { monthly_payment_date: el.id, amount: monthly_payments_cost };
        });
      }

      // 8. Validar que el restante sea mayor al minimo necesario para abonar en la siguiente mensualidad
      if (credit >= min_remainder) {
        if (payment_attributes['Monthly_Payments_Record']) {
          // 8.1. Asignar el nuevo remanente al nuevo pago de mensualidad que será creado
          payment_attributes['Monthly_Payments_Record'][
            _payment.monthlyPayments.length - 1
          ].amount += credit;

          if (remainder > 0) {
            // Eliminar el remanente del último pago
            last_monthly_payment_paid.set(
              'amount',
              last_monthly_payment_paid.amount - remainder,
              { raw: true }
            );
            await last_monthly_payment_paid.save();
          }
        } else if (last_monthly_payment_paid) {
          // 8.2. Si no existe una nueva mensualidad a crear, entonces asignar el remanente a la ultima mensualidad creada
          last_monthly_payment_paid.set(
            'amount',
            last_monthly_payment_paid.amount + credit,
            { raw: true }
          );
          await last_monthly_payment_paid.save();
        } else {
          /** FALTA LA OPCIÓN PARA ABONAR EL RESTANTE EN CASO DE QUE NO EXISTA MENSUALIDADES PREVIAS O NUEVAS MENSUALIDADES A CREAR */
        }
      } else {
        // 8.2. Abonar como contribución para la vigilancia
        if (payment_attributes['Contribution']) {
          const contrib_watchers_index = payment_attributes[
            'Contribution'
          ].findIndex(el => el.id === 4);

          if (contrib_watchers_index !== -1) {
            payment_attributes['Contribution'][
              contrib_watchers_index
            ].amount += credit;
          } else {
            payment_attributes['Contribution'].push({
              contribution_id: 4,
              amount: credit
            });
          }
        } else {
          payment_attributes['Contribution'] = [
            { contribution_id: 4, amount: credit }
          ];
        }
      }

      // 9. Crear el pago
      const payment = await Payment.create(payment_attributes, {
        include: include_models
      });

      if (payment) {
        // 5.1. Crear el pago electronico si es el caso
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
