export {};

const { Sequelize, QueryTypes } = require('sequelize');

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
const Repair_Payment = models.Repair_Payment;

const Contribution = models.Contribution;
const Contribution_Payment = models.Contribution_Payment;

const Op = Sequelize.Op;
const sequelize = models.sequelize;

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
    const total_monthly_payments_items = _payment.monthlyPayments.length;
    const total_repairs_items = _payment.repairs.length;
    const total_contributions_items = _payment.contributions.length;

    if (
      total_monthly_payments_items +
        total_repairs_items +
        total_contributions_items ===
      0
    ) {
      response.message = 'No ha seleccionado elementos por pagar o contribuir';
      return response;
    }

    // 1. Verificar que existan las mensualidades
    /* const all_monthly_payments_exists = await monthlyPaymentsExists(
      _payment.monthlyPayments
    );
    */

    if (
      total_monthly_payments_items > 0 &&
      !(await monthlyPaymentsExists(_payment.monthlyPayments))
    ) {
      response.message = 'Hay mensualidades que no existen';
      return response;
    }

    // 2. Verificar que existan las reparaciones
    /* const all_repairs_exists = await repairsExists(_payment.repairs); */

    if (total_repairs_items > 0 && !(await repairsExists(_payment.repairs))) {
      response.message = 'Hay reparaciones que no existen';
      return response;
    }

    // 3. Verificar que existan las contribuciones
    /* const all_contributions_exists = await contributionsExists(
      _payment.contributions
    ); */

    if (
      total_contributions_items > 0 &&
      !(await contributionsExists(_payment.contributions))
    ) {
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
      let repairs_costs_by_neighbor = null;

      if (total_repairs_items > 0) {
        const repairs_ids = _payment.repairs.map(el => el.id).join();

        const query = `
            SELECT Repairs.id, (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
                / ((SELECT COUNT(Neighbors.id) FROM Neighbors) - COUNT(Repairs_Payments.repair_id)) AS cost_by_neighbor
                    FROM Repairs LEFT JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id
                        WHERE Repairs.id IN (${repairs_ids}) GROUP BY (Repairs.id) ORDER BY Repairs.id ASC
        `;

        repairs_costs_by_neighbor = await sequelize.query(query, {
          type: QueryTypes.SELECT
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
      // const min_remainder = 500000; // HARD CODE

      let remainder = 0;

      // 4.4. Obtener el remanente del vecino
      if (_neighbor['neighborID'] !== -1) {
        const query = `
          SELECT SUM(Payments.amount - (SELECT COALESCE(SUM(Monthly_Payments_Record.amount), 0) FROM Monthly_Payments_Record
              WHERE Monthly_Payments_Record.payment_id = Payments.id) - (SELECT COALESCE(SUM(Repairs_Payments.amount), 0)
                  FROM Repairs_Payments WHERE Repairs_Payments.payment_id = Payments.id) 
                      - (SELECT COALESCE(SUM(Contributions_Payments.amount), 0) FROM Contributions_Payments 
                          WHERE Contributions_Payments.payment_id = Payments.id)) AS remainder
                              FROM Payments WHERE neighbor_id=${_neighbor['neighborID']}
          `;

        const result = await sequelize.query(query, {
          type: QueryTypes.SELECT,
          raw: true
        });
        remainder = result.remainder !== null ? result.remainder : 0;
        console.log(
          `El vecino ${neighbor.fullname} dispone de un remanente de ${remainder}`
        );
      }

      // 4.6. Validar que el credito sea mayor que el debito
      credit = remainder + _payment.amount;
      const remaining_balance = credit - debit;

      if (remaining_balance < 0) {
        response.message = 'El debito supera al credito';
        return response;
      }

      const payment_attributes = {
        payment_date: _payment.paymentDate,
        payment_method: _payment.paymentMethod,
        amount: _payment.amount,
        neighbor_id: neighbor.getDataValue('id')
      };

      // 9. Crear el pago
      const payment = await Payment.create(payment_attributes);

      if (payment) {
        // 9.1. Crear el pago electronico si es el caso
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

        // 5. Registrar los reparaciones pagadas
        if (total_repairs_items > 0) {
          repairs_costs_by_neighbor.forEach(async el => {
            await Repair_Payment.create({
              payment_id: payment.dataValues.id,
              repair_id: el.id,
              amount: el.cost_by_neighbor
            });
          });
        }

        // 6. Registrar las contribuciones contribuidas
        if (total_contributions_items > 0) {
          _payment.contributions.forEach(async el => {
            await Contribution_Payment.create({
              payment_id: payment.dataValues.id,
              contribution_id: el.id,
              amount: el.amount
            });
          });
        }

        // 7. Registrar las mensualidades pagadas
        if (total_monthly_payments_items > 0) {
          _payment.monthlyPayments.forEach(async el => {
            await Monthly_Payment_Record.create({
              payment_id: payment.dataValues.id,
              monthly_payment_date: el.id,
              amount: monthly_payments_cost.cost
            });
          });
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

/**
 * SELECT ((Repairs.cost - (Select COALESCE(SUM(Repairs_Payments.amount), 0) FROM Repairs_Payments 
		 		WHERE Repairs_Payments.repair_id = Repairs.id)) / 
						(SELECT NULLIF(COUNT(Neighbors.id) - COUNT(Repairs_Payments.repair_id), 0) FROM Neighbors
								INNER JOIN Payments ON Payments.neighbor_id = Neighbors.id
										INNER JOIN Repairs_Payments ON Payments.id = Repairs_Payments.payment_id 
						 						GROUP BY Repairs_Payments.repair_id)) 
														AS cost_by_neighbor FROM Repairs WHERE Repairs.id = 1;
 */

/**
  * Costo reparación - Cantidad pagada
    SELECT (Repairs.cost - (Select COALESCE(SUM(Repairs_Payments.amount), 0) FROM Repairs_Payments 
		 		WHERE Repairs_Payments.repair_id = Repairs.id)) AS cost_by_neighbor FROM Repairs WHERE Repairs.id = 1;
	
    Numero de vecinos que no han pagado (Total de vecinos - Cantidad de pagos de una reparación (Un pago único por vecino))
    SELECT ((SELECT COUNT(Neighbors.id) FROM Neighbors) - COUNT(Repairs.id)) 
        FROM Repairs INNER JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id
            WHERE Repairs.id = 1

    CONSULTA COMPLETA

    // Ob
    SELECT (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
        / ((SELECT COUNT(Neighbors.id) FROM Neighbors) - COUNT(Repairs.id))
            FROM Repairs INNER JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id
                WHERE Repairs.id IN (${}) ORDER BY Repairs.id ASC
    
  */
