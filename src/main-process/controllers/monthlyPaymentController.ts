export {};
const { Sequelize } = require('sequelize');

const models = require('../database/models/index');
const formatDateISO = require('./../helpers/format_date_ISO.ts');

const Monthly_Payment_Year_Month = models.Monthly_Payment_Year_Month;
const Monthly_Payment_Cost = models.Monthly_Payment_Cost;
const sequelize = models.sequelize;

const Neighbor = models.Neighbor;
const Op = Sequelize.Op;

const response = {
  status: 1,
  message: '',
  data: null
};

async function getUnpaidMonthlyPayments(neighborID = null) {
  try {
    response.data = [];

    if (!neighborID) {
      response.message = 'No ha sido enviado el ID del vecino';
      response.status = 0;
      response.data = null;
      return response;
    }

    const options = {
      attributes: [
        'monthly_payment_date',
        'monthly_payment_month',
        'monthly_payment_year'
      ],
      where: {},
      order: [
        ['monthly_payment_year', 'ASC'],
        ['monthly_payment_month', 'ASC']
      ]
    };

    let monthly_payments_years_months = null;

    if (neighborID === -1) {
      // Vecino no existe, entonces recuperar todos las mensualidades desde el año y mes actual
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      options['where']['monthly_payment_date'] = {
        [Op.gte]: [formatDateISO.formatDateISO(1, month, year)]
      };

      monthly_payments_years_months = await Monthly_Payment_Year_Month.findAll(
        options
      );
    } else {
      const neighbor = await Neighbor.findOne({
        where: {
          id: neighborID
        }
      });

      if (!neighbor) {
        response.message = 'El vecino no existe';
        return response;
      }

      const arr_created_at = neighbor.created_at.split('-');

      /*        
          SELECT A.*
            FROM A
              LEFT JOIN B ON (A.C = B.C)
                WHERE B.C IS NULL
        */

      const query = `
        SELECT Monthly_Payments_Years_Months.monthly_payment_date, Monthly_Payments_Years_Months.monthly_payment_year,
           Monthly_Payments_Years_Months.monthly_payment_month
              FROM Monthly_Payments_Years_Months LEFT JOIN
                (SELECT monthly_payment_date FROM Monthly_Payments_Record
                    INNER JOIN Payments ON Payments.id = Monthly_Payments_Record.payment_id 
                        AND Payments.neighbor_id=${neighborID}) AS Paid_Monthly_Payments_Dates
                            ON Monthly_Payments_Years_Months.monthly_payment_date = Paid_Monthly_Payments_Dates.monthly_payment_date
                                WHERE Paid_Monthly_Payments_Dates.monthly_payment_date IS NULL
                                    AND Monthly_Payments_Years_Months.monthly_payment_year >= ${arr_created_at[0]}
      `;

      monthly_payments_years_months = await sequelize.query(query, {
        model: Monthly_Payment_Year_Month,
        mapToModel: true // pass true here if you have any mapped fields
      });
    }

    const data = monthly_payments_years_months.map(el => {
      return {
        id: el.monthly_payment_date,
        month: el.monthly_payment_month,
        year: el.monthly_payment_year
      };
    });

    response.status = 1;
    response.message =
      monthly_payments_years_months.length > 0
        ? 'Mensualidades por pagar encontradas'
        : 'No hay mensualidades por pagar';
    response.data = data;

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message = 'Ocurrio un error al procesar las mensualidades';
    response.data = null;
    return response;
  }
}

async function getMonthlyPaymentCost() {
  const monthly_payments_cost = await Monthly_Payment_Cost.findOne({
    order: [['id', 'DESC']]
  });

  if (monthly_payments_cost) {
    response.status = 1;
    response.data = monthly_payments_cost.cost;
    response.message = 'Cost actual de la mensualidad';
    return response;
  }

  response.status = 0;
  response.data = 0;
  response.message = 'No hay al menos un costo registrado para la mensualidad';

  return response;
}

module.exports = {
  getUnpaidMonthlyPayments,
  getMonthlyPaymentCost
};
