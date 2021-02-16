export {};
const { Sequelize } = require('sequelize');

const models = require('../database/models/index');
const formatDateISO = require('./../helpers/format_date_ISO.ts');

const Monthly_Payments_Record = models.Monthly_Payments_Record;
const Monthly_Payment_Year_Month = models.Monthly_Payment_Year_Month;
const Monthly_Payment_Cost = models.Monthly_Payment_Cost;
const Payment = models.Payment;
const sequelize = models.sequelize;

const Neighbor = models.Neighbor;
const Op = Sequelize.Op;

const response = {
  status: 1,
  message: '',
  data: {}
};

/**
 * 1. Obtener el vecino de acuerdo a su ID
 * 2. Recuperar la columna created_at
 * 3. Recuperar las mensualidades desde el mes y año en el que fue creado el vecino (Nota: Una persona es considerada vecino de la residencia
 *  desde el momento en el que se le atribuye el primer pago de mensualidad, por lo tanto, al momento de migrar los vecinos desde la hoja
 *  de calculo hacia la aplicación se debe obtener la primera mensualidad que se le fue atribuida, y se debe cambiar la columna created_at a
 *  la fecha de la primera mensualidad atribuida)
 * 4. Hacer una diferencia entre los meses pagados y los meses por pagar.
 */
async function getUnpaidMonthlyPayments(neighborID = null) {
  try {
    response.data = [];

    if (!neighborID) {
      response.message = 'No ha sido enviado el ID del vecino';
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

    if (neighborID === -1) {
      // Vecino no existe, entonces recuperar todos las mensualidades desde el año y mes actual
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      options['where']['monthly_payment_date'] = {
        [Op.gte]: [formatDateISO.formatDateISO(1, month, year)]
      };
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

      const monthly_payments_years_months = await sequelize.query(query, {
        model: Monthly_Payment_Year_Month,
        mapToModel: true // pass true here if you have any mapped fields
      });

      console.log(monthly_payments_years_months);

      /* const monthly_payment_record_join = {
            model: Monthly_Payments_Record,
            attributes: ['monthly_payment_date'],
            required: false,
            include: [
              {
                model: Payment,
                required: true,
                where: {
                  neighbor_id: {
                    [Op.eq]: [neighborID]
                  },
                }
              }
            ],
          };

          options['include'] = [monthly_payment_record_join];
          options['where']['monthly_payment_date'] = {
            [Op.eq]: [null]
          }
          options['where']['monthly_payment_year'] = {
            [Op.gte]: [arr_created_at[0]]
          }
        }

        const monthly_payments_years_months = await Monthly_Payment_Year_Month.findAll(options); */

      const data = monthly_payments_years_months.map(el => {
        return {
          id: el.monthly_payment_date,
          month: el.monthly_payment_month,
          year: el.monthly_payment_year
        };
      });

      /* console.log(data); */

      response.message =
        monthly_payments_years_months.length > 0
          ? 'Mensualidades por pagar encontradas'
          : 'No hay mensualidades por pagar';
      response.data = data;
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message = 'Ocurrio un error al procesar las mensualidades';
    return response;
  }
}

async function getMonthlyPaymentCost() {
  const monthly_payments_cost = await Monthly_Payment_Cost.findOne({
    order: [['id', 'DESC']]
  });

  if (monthly_payments_cost) {
    response.data = monthly_payments_cost.cost;
    response.message = 'Cost actual de la mensualidad';
    return response;
  }

  response.data = 0;
  response.message = 'No hay al menos un costo registrado para la mensualidad';
  return response;
}

/* async function create(_mensualidad) {
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
}; */

module.exports = {
  getUnpaidMonthlyPayments,
  getMonthlyPaymentCost
};
