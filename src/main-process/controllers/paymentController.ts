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

async function getPayment(paymentID = -1) {
  try {
    response.data = null;

    if (paymentID === -1) {
      response.message = 'Por favor, envíe un ID valido';
      return response;
    }

    const neighbor_join = {
      model: Neighbor,
      required: true
    };

    const electronic_payment_join = {
      model: Electronic_Payment,
      attributes: [['reference_number', 'referenceNumber']],
      required: false,
      include: [
        {
          model: Bank,
          attributes: ['id'],
          required: false
        }
      ]
    };

    const monthly_payment_record_join = {
      model: Monthly_Payment_Record,
      attributes: ['monthly_payment_date', 'amount'],
      include: [
        {
          model: Monthly_Payment_Year_Month,
          attributes: [
            ['monthly_payment_month', 'month'],
            ['monthly_payment_year', 'year']
          ],
          required: true
        }
      ],
      required: false
    };

    const repair_join = {
      model: Repair,
      attributes: ['title', ['issue_date', 'issueDate']],
      required: false
    };

    const contribution_join = {
      model: Contribution,
      attributes: ['title'],
      required: false
    };

    const options = {
      include: [
        neighbor_join,
        electronic_payment_join,
        monthly_payment_record_join,
        repair_join,
        contribution_join
      ],
      where: {
        id: {
          [Op.eq]: paymentID
        }
      }
    };

    const payment = await Payment.findOne(options);

    if (!payment) {
      response.message = 'Este pago no existe';
    } else {
      response.data = {
        payment: {
          id: payment.id,
          neighborID: payment.neighbor_id,
          paymentDate: payment.payment_date,
          paymentMethod: payment.payment_method,
          amount: payment.amount,
          referenceNumber: payment.Electronic_Payment
            ? payment.Electronic_Payment.dataValues.referenceNumber
            : '',
          bank: payment.Electronic_Payment
            ? payment.Electronic_Payment.Bank.dataValues.id
            : '',
          monthlyPayments: payment.Monthly_Payment_Records
            ? payment.Monthly_Payment_Records.map(el => {
                return {
                  id: el.dataValues.monthly_payment_date,
                  amount: el.dataValues.amount,
                  month: el.Monthly_Payment_Year_Month.dataValues.month,
                  year: el.Monthly_Payment_Year_Month.dataValues.year
                };
              })
            : [],
          repairs: payment.Repairs
            ? payment.Repairs.map(el => {
                return {
                  id: el.Repair_Payment.repair_id,
                  cost: el.Repair_Payment.amount,
                  title: el.dataValues.title,
                  issueDate: el.dataValues.issueDate
                };
              })
            : [],
          contributions: payment.Contributions
            ? payment.Contributions.map(el => {
                return {
                  id: el.Contribution_Payment.contribution_id,
                  amount: el.Contribution_Payment.amount,
                  title: el.dataValues.title
                };
              })
            : []
        },
        neighbor: {
          id: payment.Neighbor.dataValues.id,
          fullName: payment.Neighbor.dataValues.fullname,
          dni: payment.Neighbor.dataValues.dni
        }
      };

      console.log(response.data);
    }

    return response;
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error durante la recuperación del pago',
      data: null
    };
  }
}

async function edit(paymentID = -1) {
  if (paymentID === -1) {
    return { status: 1, data: null, message: 'Por favor, envíe un ID valido' };
  }

  try {
    const response = await getPayment(paymentID);

    // Válido que este sea el último pago realizado por el vecino
    if (response.data) {
      const neighbor_last_payment = await Payment.findOne({
        order: [['id', 'DESC']],
        where: {
          neighbor_id: {
            [Op.eq]: response.data.neighbor.id
          }
        }
      });

      if (neighbor_last_payment.id !== paymentID) {
        return {
          status: 1,
          data: null,
          message: 'No puede modificar este pago, ya existen pagos posteriores'
        };
      }
    }

    return response;
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error durante la recuperación del pago',
      data: null
    };
  }
}

async function update(_payment) {
  try {
    const new_total_monthly_payments_items = _payment.monthlyPayments.length;
    const new_total_repairs_items = _payment.repairs.length;
    const new_total_contributions_items = _payment.contributions.length;

    if (
      new_total_monthly_payments_items +
        new_total_repairs_items +
        new_total_contributions_items ===
      0
    ) {
      response.status = 0;
      response.data = {};
      response.message = 'No ha seleccionado elementos por pagar o contribuir';
      return response;
    }

    // 1. Verificar que existan todas las mensualidades
    if (
      new_total_monthly_payments_items > 0 &&
      !(await monthlyPaymentsExists(_payment.monthlyPayments))
    ) {
      response.message = 'Hay mensualidades que no existen';
      return response;
    }

    // 2. Verificar que existan todas las reparaciones
    if (
      new_total_repairs_items > 0 &&
      !(await repairsExists(_payment.repairs))
    ) {
      response.message = 'Hay reparaciones que no existen';
      return response;
    }

    // 3. Verificar que existan todas las contribuciones
    if (
      new_total_contributions_items > 0 &&
      !(await contributionsExists(_payment.contributions))
    ) {
      response.message = 'Hay contribuciones que no existen';
      return response;
    }

    // 4. Recuperar los datos del pago antes de actualizar
    const old_payment = await getPayment(_payment.id);

    let debit = 0;
    let credit = 0;

    // 5. Obtener el debito de las mensualidades
    let monthly_payments_cost = null;
    let added_monthly_payments = [];

    const monthly_payments_dates = _payment.monthlyPayments
      .map(el => el.id)
      .join();

    // 5.2. Obtener las mensualidades que fueron agregadas
    if (new_total_monthly_payments_items > 0) {
      // 5.2.1. Obtener el costo actual de la mensualidad
      monthly_payments_cost = await Monthly_Payment_Cost.findOne({
        order: [['id', 'DESC']]
      });

      // 5.2.2. Filtrar las mensualidades que fueron agregadas (B - A)
      let query = `SELECT Monthly_Payments_Years_Months.monthly_payment_date from Monthly_Payments_Years_Months 
          LEFT JOIN Monthly_Payments_Record 
              ON (Monthly_Payments_Record.monthly_payment_date = Monthly_Payments_Years_Months.monthly_payment_date
                  AND Monthly_Payments_Record.payment_id = ${_payment.id} ) WHERE Monthly_Payments_Record.monthly_payment_date IS NULL 
                      AND Monthly_Payments_Years_Months.monthly_payment_date IN (${monthly_payments_dates})`;

      added_monthly_payments = await sequelize.query(query, {
        model: Monthly_Payment_Year_Month,
        mapToModel: true
      });
    }

    let removed_monthly_payments = [];

    // 5.2. Obtener las mensualidades que fueron retiradas
    if (old_payment.data.payment.monthlyPayments.length > 0) {
      let query = '';

      if (new_total_monthly_payments_items > 0) {
        // 5.2.1. Filtrar las mensualidades que fueron retiradas (A - B)
        query = `SELECT Monthly_Payments_Record.* from Monthly_Payments_Record 
            LEFT JOIN Monthly_Payments_Years_Months 
                ON (Monthly_Payments_Record.monthly_payment_date = Monthly_Payments_Years_Months.monthly_payment_date
                    AND Monthly_Payments_Years_Months.monthly_payment_date IN (${monthly_payments_dates}))
                        WHERE Monthly_Payments_Record.payment_id = ${_payment.id} 
                            AND Monthly_Payments_Years_Months.monthly_payment_date IS NULL`;
      } else {
        // 5.2.2. Todas las mensualidades fueron retiradas
        query = `SELECT Monthly_Payments_Record.* from Monthly_Payments_Record
             WHERE Monthly_Payments_Record.payment_id = ${_payment.id}`;
      }

      removed_monthly_payments = await sequelize.query(query, {
        model: Monthly_Payment_Record,
        mapToModel: true
      });
    }

    debit +=
      old_payment.data.payment.monthlyPayments.reduce(
        (acc, el) => acc + el.amount,
        0
      ) +
      added_monthly_payments.length *
        (monthly_payments_cost ? monthly_payments_cost.cost : 0) -
      removed_monthly_payments.reduce((acc, el) => acc + el.amount, 0);

    // 6. Obtener el debito de las reparaciones
    const repairs_ids = _payment.repairs.map(el => el.id).join();
    let added_repairs = [];

    if (new_total_repairs_items > 0) {
      // 6.1. Filtrar las reparaciones que fueron agregadas (B - A)
      let query = `SELECT Repairs.id, (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
          / ((SELECT COUNT(Neighbors.id) FROM Neighbors) - COUNT(Repairs_Payments.repair_id)) AS cost_by_neighbor
              FROM Repairs LEFT JOIN Repairs_Payments ON (Repairs_Payments.repair_id = Repairs.id 
                  AND Repairs_Payments.payment_id = ${_payment.id}) WHERE Repairs_Payments.repair_id IS NULL 
                      AND Repairs.id IN (${repairs_ids}) GROUP BY (Repairs.id) ORDER BY Repairs.id ASC`;

      added_repairs = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
    }

    let removed_repairs = [];

    if (old_payment.data.payment.repairs.length > 0) {
      let query = '';

      if (new_total_repairs_items > 0) {
        // 6.2. Filtrar las reparaciones que fueron retiradas (A - B)
        query = `SELECT Repairs_Payments.* from Repairs_Payments LEFT JOIN Repairs 
            ON (Repairs_Payments.repair_id = Repairs.id AND Repairs.id IN (${repairs_ids}))
                WHERE Repairs_Payments.payment_id = ${_payment.id} AND Repairs.id IS NULL`;
      } else {
        query = `
            SELECT Repairs_Payments.* from Repairs_Payments 
                WHERE Repairs_Payments.payment_id = ${_payment.id}`;
      }

      removed_repairs = await sequelize.query(query, {
        model: Repair_Payment,
        mapToModel: true
      });
    }

    debit +=
      old_payment.data.payment.repairs.reduce((acc, el) => acc + el.cost, 0) +
      added_repairs.reduce((acc, el) => acc + el.cost_by_neighbor, 0) -
      removed_repairs.reduce((acc, el) => acc + el.amount, 0);

    // 7. Obtener la cantidad de dinero que se va a contribuir
    const contributions_ids = _payment.contributions.map(el => el.id).join();
    let added_contributions = [];

    if (new_total_contributions_items > 0) {
      // 7.1. Filtrar las contribuciones que fueron agregadas (B - A)
      let query = `
          SELECT Contributions.id FROM Contributions LEFT JOIN Contributions_Payments ON 
              (Contributions_Payments.contribution_id = Contributions.id AND Contributions_Payments.payment_id=${_payment.id})
                  WHERE Contributions_Payments.contribution_id IS NULL 
                      AND Contributions.id IN (${contributions_ids})`;

      added_contributions = await sequelize.query(query, {
        model: Contribution,
        mapToModel: true
      });
    }

    let removed_contributions = [];

    if (old_payment.data.payment.contributions.length > 0) {
      let query = '';

      // 7.2. Filtrar las contribuciones que fueron retiradas (A - B)
      if (new_total_contributions_items > 0) {
        query = `
            SELECT Contributions_Payments.* from Contributions_Payments LEFT JOIN Contributions 
                ON (Contributions_Payments.contribution_id = Contributions.id
                    AND Contributions.id IN (${contributions_ids}))
                        WHERE Contributions_Payments.payment_id=${_payment.id} AND Contributions.id IS NULL`;
      } else {
        query = `
            SELECT Contributions_Payments.* from Contributions_Payments 
                WHERE Contributions_Payments.payment_id = ${_payment.id}
        `;
      }

      removed_contributions = await sequelize.query(query, {
        model: Contribution_Payment,
        mapToModel: true
      });
    }

    let permanent_contributions = [];
    if (
      old_payment.data.payment.contributions.length > 0 &&
      new_total_contributions_items > 0
    ) {
      // 7.3. Filtras las cotribuciones que se mantuvieron
      let query = `
        SELECT Contributions_Payments.* FROM Contributions INNER JOIN Contributions_Payments ON 
            (Contributions_Payments.contribution_id = Contributions.id AND Contributions_Payments.payment_id = ${_payment.id})
                WHERE Contributions.id IN (${contributions_ids})
      `;

      permanent_contributions = await sequelize.query(query, {
        model: Contribution,
        mapToModel: true
      });
    }

    debit += _payment.contributions.reduce((acc, el) => acc + el.amount, 0);

    console.log(`El debito es ${debit}`);

    let remainder = 0;

    // 8. Obtener el remanente del vecino
    let query = `
      SELECT SUM(Payments.amount - (SELECT COALESCE(SUM(Monthly_Payments_Record.amount), 0) FROM Monthly_Payments_Record
          WHERE Monthly_Payments_Record.payment_id = Payments.id) - (SELECT COALESCE(SUM(Repairs_Payments.amount), 0)
              FROM Repairs_Payments WHERE Repairs_Payments.payment_id = Payments.id) 
                  - (SELECT COALESCE(SUM(Contributions_Payments.amount), 0) FROM Contributions_Payments 
                      WHERE Contributions_Payments.payment_id = Payments.id)) AS remainder
                          FROM Payments WHERE neighbor_id=${old_payment.data.neighbor.id} AND id != ${old_payment.data.payment.id}
    `;

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true
    });

    remainder = result.remainder !== null ? result.remainder : 0;

    // 9. Validar que el credito sea mayor que el debito
    credit = remainder + _payment.amount;
    const remaining_balance = credit - debit;

    if (remaining_balance < 0) {
      response.status = 1;
      response.message = 'El debito supera al credito';
      response.data = {};
      return response;
    }

    // 10. Actualizar el pago

    //10.1. Verificar si cambió el metodo de pago
    if (_payment.paymentMethod !== old_payment.data.payment.payment_method) {
      if (
        old_payment.data.payment.payment_method === 'Efectivo' &&
        _payment.paymentMethod !== 'Efectivo'
      ) {
        let electronic_payment = await Electronic_Payment.create({
          payment_id: _payment.id,
          bank_id: _payment.bank,
          reference_number: _payment.referenceNumber
        });

        if (!electronic_payment) {
          return {
            status: 1,
            message: 'No se ha podido actualizar el pago',
            data: null
          };
        }
      } else if (
        old_payment.data.payment.payment_method !== 'Efectivo' &&
        _payment.paymentMethod === 'Efectivo'
      ) {
        const no_affected_rows = await Electronic_Payment.destroy({
          where: {
            payment_id: {
              [Op.eq]: _payment.id
            }
          }
        });

        if (no_affected_rows === 0) {
          return {
            status: 1,
            message: 'No se ha podido actualizar el pago',
            data: null
          };
        }
      }
    }

    // 10.2. Verificar si permanece el pago electronico
    if (
      old_payment.data.payment.payment_method !== 'Efectivo' &&
      _payment.paymentMethod !== 'Efectivo'
    ) {
      const e_payment_attributes = {
        bank_id: _payment['bank'] ? _payment['bank'] : null,
        reference_number: _payment['referenceNumber']
          ? _payment['referenceNumber']
          : ''
      };

      const affected_rows = await Electronic_Payment.update(
        e_payment_attributes,
        {
          where: {
            payment_id: {
              [Op.eq]: [_payment.id]
            }
          }
        }
      );

      if (affected_rows[0] === 0) {
        response.status = 1;
        response.message = 'No se ha podido actualizar el registro';
        response.data = null;
        return response;
      }
    }

    //10.2. Cambiar los datos del pago
    const payment_attributes = {
      payment_date: _payment.paymentDate,
      payment_method: _payment.paymentMethod,
      amount: _payment.amount
    };

    const affected_rows = await Payment.update(payment_attributes, {
      where: {
        id: {
          [Op.eq]: [_payment.id]
        }
      }
    });

    if (affected_rows[0] === 0) {
      response.status = 1;
      response.message = 'No se ha podido actualizar el registro';
      response.data = null;
      return response;
    }

    // 11. Actualizar las mensualidades asociadas al pago

    // 11.1. Asociar nuevas mensualidades
    added_monthly_payments.forEach(async el => {
      await Monthly_Payment_Record.create({
        payment_id: _payment.id,
        monthly_payment_date: el.monthly_payment_date,
        amount: monthly_payments_cost ? monthly_payments_cost.cost : 0
      });
    });

    // 11.2. Desligar las mesualidades
    removed_monthly_payments.forEach(async el => await el.destroy());

    // 12.1. Asociar las nuevas reparaciones
    added_repairs.forEach(async el => {
      await Repair_Payment.create({
        payment_id: _payment.id,
        repair_id: el.id,
        amount: el.cost_by_neighbor
      });
    });

    // 12.2. Desligar las reparaciones
    removed_repairs.forEach(async el => await el.destroy());

    // 13.1. Asociar las nuevas contribuciones
    added_contributions.forEach(async el => {
      await Contribution_Payment.create({
        payment_id: _payment.id,
        contribution_id: el.id,
        amount: _payment.contributions.find(contrib => contrib.id === el.id)
          .amount
      });
    });

    // 13.2. Desligar las contribuciones
    removed_contributions.forEach(async el => await el.destroy());

    // 13.3. Actualizar las contribuciones permanentes
    permanent_contributions.forEach(
      async el =>
        await el.update({
          amount: _payment.contributions.find(contrib => contrib.id === el.id)
            .amount
        })
    );
  } catch (error) {
    console.error(error);
    return {
      status: '0',
      message: 'ha ocurrido un error durante el registro en la base de datos',
      data: error
    };
  }
}

module.exports = {
  getPayments,
  create,
  getPaymentsCount,
  edit,
  getPayment,
  update
};

/* // Esta consulta me devuelve las nuevas mensualidades que fueron agregadas
SELECT Monthly_Payments_Years_Months.* from Monthly_Payments_Years_Months LEFT JOIN Monthly_Payments_Record 
  ON (Monthly_Payments_Record.monthly_payment_date = Monthly_Payments_Years_Months.monthly_payment_date
    AND Monthly_Payments_Record.payment_id=3)
      WHERE Monthly_Payments_Record.monthly_payment_date IS NULL 
          AND Monthly_Payments_Years_Months.monthly_payment_date IN ('2021-03-01', '2021-04-01');

// Obtener las mensualidades que fueron retiradas del pago.
SELECT Monthly_Payments_Record.monthly_payment_date from Monthly_Payments_Record LEFT JOIN Monthly_Payments_Years_Months 
  ON (Monthly_Payments_Record.monthly_payment_date = Monthly_Payments_Years_Months.monthly_payment_date
    AND Monthly_Payments_Years_Months.monthly_payment_date IN ('2021-03-01', '2021-05-01'))
      WHERE Monthly_Payments_Record.payment_id=3 AND Monthly_Payments_Years_Months.monthly_payment_date IS NULL; */

/* 
  // Esta consulta me devuelve las nuevas reparaciones que fueron agregadas junto a su costo
  SELECT Repairs.id, (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
      / ((SELECT COUNT(Neighbors.id) FROM Neighbors) - COUNT(Repairs_Payments.repair_id)) AS cost_by_neighbor
          FROM Repairs LEFT JOIN Repairs_Payments ON (Repairs_Payments.repair_id = Repairs.id AND Repairs_Payments.payment_id=3)
              WHERE Repairs_Payments.repair_id IS NULL 
                  AND Repairs.id IN (2, 3, 4) GROUP BY (Repairs.id) ORDER BY Repairs.id ASC
  
  // Obtener las reparaciones que fueron retiradas del pago.
  SELECT Repairs_Payments.* from Repairs_Payments LEFT JOIN Repairs 
    ON (Repairs_Payments.repair_id = Repairs.id
      AND Repairs.id IN (2, 3, 4))
        WHERE Repairs_Payments.payment_id=3 AND Repairs.id IS NULL;
*/

/**
  
 // Esta consulta me devuelve las nuevas contribuciones que fueron agregadas (Para agregar la cantidad contribuida)
  SELECT Contributions.id FROM Contributions LEFT JOIN Contributions_Payments ON 
      (Contributions_Payments.contribution_id = Contributions.id AND Contributions_Payments.payment_id=3)
              WHERE Contributions_Payments.contribution_id IS NULL 
                  AND Contributions.id IN (2, 3, 4);

  // Obtener las contribuciones que se mantienen en el pago (Para actualizar la cantidad contribuida)
  SELECT Contributions.id FROM Contributions INNER JOIN Contributions_Payments ON 
      (Contributions_Payments.contribution_id = Contributions.id AND Contributions_Payments.payment_id=3)
              WHERE Contributions.id IN (2, 3, 4);
  
  // Obtener las contribuciones que fueron retiradas del pago. (Para liberar la cantidad contribuida)
  SELECT Contributions_Payments.* from Contributions_Payments LEFT JOIN Contributions 
    ON (Contributions_Payments.contribution_id = Contributions.id
      AND Contributions.id IN (1))
        WHERE Contributions_Payments.payment_id=3 AND Contributions.id IS NULL;
 */
