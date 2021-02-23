export {};
const { Sequelize, QueryTypes } = require('sequelize');

const models = require('../database/models/index');

const paginate = require('../helpers/paginate');

const Repair = models.Repair;
const Neighbor = models.Neighbor;

const sequelize = models.sequelize;

const Op = Sequelize.Op;

const response = {
  status: 1,
  message: '',
  data: {}
};

async function getRepairsCount() {
  try {
    const result = await Repair.count();
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

async function getRepair(repairID = -1) {
  try {
    response.data = null;

    if (repairID === -1) {
      response.message = 'Por favor, envíe un ID valido';
      return response;
    }

    const query = `
        SELECT Repairs.id, Repairs.title, Repairs.description, Repairs.cost, Repairs.issue_date,
            (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
                AS remaining FROM Repairs LEFT JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id 
                    WHERE Repairs.id = ${repairID} GROUP BY (Repairs.id) LIMIT 1
    `;

    const repair = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      plain: true
    });
    console.log(repair);

    if (!repair) {
      response.message = 'Esta reparación no existe';
    } else {
      response.data = {
        id: repair.id,
        issueDate: repair.issue_date,
        title: repair.title,
        description: repair.description,
        cost: repair.cost,
        remaining: repair.remaining
      };
    }

    return response;
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message:
        'Ha ocurrido un error durante la recuperación de las reparaciones',
      data: error
    };
  }
}

async function edit(repairID) {
  const response = await getRepair(repairID);

  if (response.data && response.data.remaining <= 0) {
    response.message = 'Esta reparación ya ha sido pagada en su totalidad';
    response.data = null;
  }

  return response;
}

async function update(_repair) {
  try {
    const response = await getRepair(_repair.id);

    if (!response.data) {
      response.message = 'Esta reparación no existe';
    } else if (response.data && response.data.remaining <= 0) {
      response.message = 'Esta reparación ya ha sido pagada en su totalidad';
      response.data = null;
    } else {
      const result = await Repair.update(
        {
          title: _repair.title,
          description: _repair.description,
          cost: _repair.cost,
          issue_date: _repair.issueDate
        },
        {
          where: {
            id: {
              [Op.eq]: [_repair.id]
            }
          }
        }
      );

      if (result[0] === 1) {
        response.message = 'Registro actualizado con exito';
        response.data = _repair;
      }
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message =
      'Ha ocurrido un error al intentar actualizar la reparación';
    return response;
  }
}

async function getRepairs(repairID, searchCriterias, searchOptions) {
  try {
    const pageIndex = searchOptions.pageIndex;
    const pageSize = searchOptions.pageSize;
    const { offset, limit } = paginate.paginate({ pageIndex, pageSize });

    const whereRepairs = [];
    let havingClause = '';

    // Repair search criterias
    if (repairID !== -1) {
      whereRepairs.push(`Repairs.id = ${repairID}`);
    }

    if (searchCriterias.repairTitle !== '') {
      whereRepairs.push(
        `${whereRepairs.length > 0 ? 'AND ' : ''}Repairs.title LIKE '%${
          searchCriterias.repairTitle
        }%'`
      );
    }

    if (
      searchCriterias.repairStartDate &&
      searchCriterias.repairStartDate !== '' &&
      !searchCriterias.repairEndDate
    ) {
      whereRepairs.push(
        `${whereRepairs.length > 0 ? 'AND ' : ''}Repairs.issue_date = '${
          searchCriterias.repairStartDate
        }'`
      );
    } else if (
      searchCriterias.repairStartDate &&
      searchCriterias.repairStartDate !== '' &&
      searchCriterias.repairEndDate !== ''
    ) {
      whereRepairs.push(`${
        whereRepairs.length > 0 ? 'AND ' : ''
      }Repairs.issue_date BETWEEN '${searchCriterias.repairStartDate}' 
          AND '${searchCriterias.repairEndDate}'`);
    }

    if (searchCriterias.repairStatus !== 0) {
      if (searchCriterias.repairStatus === 1) {
        // No pagado
        havingClause =
          'HAVING Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0) > 0';
      } else {
        // Pagado
        havingClause =
          'HAVING Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0) <= 0';
      }
    }

    const query = `
        SELECT Repairs.id, Repairs.title, Repairs.cost, Repairs.issue_date, (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) AS remaining
            FROM Repairs LEFT JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id 
                ${
                  whereRepairs.length > 0
                    ? `WHERE ${whereRepairs.join(' ')}`
                    : ''
                } GROUP BY (Repairs.id) ${havingClause}
                    ORDER BY Repairs.id ASC LIMIT ${offset},${offset + limit}
    `;

    const repairs = await sequelize.query(query, { type: QueryTypes.SELECT });

    return {
      status: '1',
      message: 'Reparaciones encontrados',
      data: repairs.map(el => {
        return {
          id: el.id,
          title: el.title,
          issueDate: el.issue_date,
          cost: el.cost,
          remaining: el.remaining
        };
      })
    };
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message:
        'Ha ocurrido un error durante la recuperación de las reparaciones',
      data: error
    };
  }
}

async function getUnpaidRepairs(neighborID = null) {
  try {
    response.data = [];

    if (!neighborID) {
      response.message = 'No ha sido enviado el ID del vecino';
      return response;
    }

    let repairs = null;
    let query = '';

    if (neighborID === -1) {
      // Vecino no existe, entonces recuperar todas las reparaciones que no han sido pagadas en su totalidad
      query = `
        SELECT Repairs.id, Repairs.title, Repairs.issue_date, (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
          / ((SELECT COUNT(Neighbors.id) FROM Neighbors) + 1 - COUNT(Repairs_Payments.repair_id)) AS cost_by_neighbor
            FROM Repairs LEFT JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id
              GROUP BY (Repairs.id) HAVING (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) > 0 
                ORDER BY Repairs.id ASC
      `;
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

      // Vecino existe, entonces recuperar las reparaciones que aun no ha pagado
      query = `
        SELECT Repairs.id, Repairs.title, Repairs.issue_date, (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) 
            / ((SELECT COUNT(Neighbors.id) FROM Neighbors) - COUNT(Repairs_Payments.repair_id)) AS cost_by_neighbor
                FROM Repairs LEFT JOIN (SELECT repair_id FROM Repairs_Payments 
                      INNER JOIN Payments ON Payments.id = Repairs_Payments.payment_id 
                          AND Payments.neighbor_id=${neighborID}) AS Paid_Repairs ON Repairs.id = Paid_Repairs.repair_id 
                                      LEFT JOIN Repairs_Payments ON Repairs_Payments.repair_id = Repairs.id
                                        WHERE Paid_Repairs.repair_id IS NULL
                                          GROUP BY (Repairs.id) 
                                              HAVING (Repairs.cost - COALESCE(SUM(Repairs_Payments.amount), 0)) > 0 
                                                  ORDER BY Repairs.id ASC
      `;
    }

    repairs = await sequelize.query(query, { type: QueryTypes.SELECT });
    console.log(repairs);

    const data = repairs.map(el => {
      return {
        id: el.id,
        title: el.title,
        issueDate: el.issue_date,
        cost: el.cost_by_neighbor
      };
    });

    response.message =
      data.length > 0
        ? 'Reparaciones por pagar encontradas'
        : 'No hay reparaciones por pagar';
    response.data = data;

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message = 'Ocurrio un error al procesar las mensualidades';
    return response;
  }
}

async function create(_repair) {
  try {
    const repair_attributes = {
      title: _repair.title,
      description: _repair.description,
      issue_date: _repair.issueDate,
      cost: _repair.cost
    };

    // 9. Crear el pago
    const repair = await Repair.create(repair_attributes);

    if (repair) {
      return {
        status: '1',
        message: 'Reparación registrada con exito',
        data: repair.dataValues
      };
    } else {
      console.log('Registro de reparación fallido');
      return {
        status: '0',
        message: 'El registro del pago ha fallado',
        data: {}
      };
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

module.exports = {
  getUnpaidRepairs,
  getRepairs,
  getRepair,
  getRepairsCount,
  create,
  update,
  edit
};
