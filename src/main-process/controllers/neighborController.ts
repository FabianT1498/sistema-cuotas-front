export {};

const models = require('../database/models/index');

const { UniqueConstraintError, Sequelize } = require('sequelize');

const paginate = require('../helpers/paginate');

const Neighbor = models.Neighbor;
const House = models.House;

const response = {
  status: 1,
  message: '',
  data: {}
};

const Op = Sequelize.Op;

async function getNeighborsCount() {
  try {
    const result = await Neighbor.count();
    console.log(result);
    return { status: '1', message: 'Total de vecinos', data: result };
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error',
      data: error
    };
  }
}

async function getNeighbors(neighborID, searchCriterias, searchOptions) {
  try {
    const Op = Sequelize.Op;

    const pageIndex = searchOptions.pageIndex;
    const pageSize = searchOptions.pageSize;

    const whereNeighbors = {};

    // Neighbor search criterias
    if (neighborID !== -1) {
      whereNeighbors['id'] = neighborID;
    }

    if (searchCriterias.dni !== '') {
      whereNeighbors['dni'] = {
        [Op.eq]: searchCriterias.dni
      };
    }

    if (searchCriterias.houseNumber !== '') {
      whereNeighbors['house_no'] = {
        [Op.eq]: searchCriterias.houseNumber
      };
    }

    const options = {
      attributes: [
        'id',
        ['fullname', 'fullName'],
        'dni',
        ['house_no', 'houseNumber']
      ],
      ...paginate.paginate({ pageIndex, pageSize })
    };

    if (Object.keys(whereNeighbors).length > 0) {
      options['where'] = whereNeighbors;
    }

    const result = await Neighbor.findAll(options);
    console.log(result);

    return {
      status: '1',
      message: 'Vecinos encontrados',
      data: result.map(el => el.dataValues)
    };
  } catch (error) {
    console.log(error);
    return {
      status: '0',
      message: 'Ha ocurrido un error durante la recuperación de los vecinos',
      data: error
    };
  }
}

async function findByDNI(dni) {
  try {
    const neighbor = await Neighbor.findOne({ where: { dni } });

    return {
      status: 1,
      message: neighbor ? 'Vecino encontrado' : 'Vecino no encontrado',
      data: neighbor ? neighbor.dataValues : null
    };
  } catch (error) {
    console.error(error);

    return {
      status: 0,
      message: 'Ha ocurrido un error durante la operacion',
      data: error
    };
  }
}

async function findHouseByNumber(house_no) {
  try {
    const house = House.findOne({
      where: {
        house_no: {
          [Op.eq]: [house_no]
        }
      }
    });

    if (house) {
      response.message = 'Casa encontrada';
      response.data = house;
    } else {
      response.message = 'Casa no encontrada';
      response.data = null;
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message =
      'Ha ocurrido un error durante el registro en la base de datos';
    return response;
  }
}

async function getNeighbor(neighborID = -1) {
  try {
    response.data = null;

    if (neighborID === -1) {
      response.message = 'Por favor, envíe un ID valido';
      return response;
    }

    const neighbor = await Neighbor.findOne({
      include: House,
      where: {
        id: {
          [Op.eq]: [neighborID]
        }
      }
    });

    if (neighbor) {
      response.message = 'Vecino encontrado';
      console.log(neighbor);
      response.data = {
        id: neighbor.id,
        fullName: neighbor.fullname,
        dni: neighbor.dni,
        email: neighbor.email_address,
        phoneNumber: neighbor.phone_number,
        houseNumber: neighbor.house_no,
        street: neighbor.House ? neighbor.House.dataValues.street : ''
      };
    } else {
      response.message = 'Vecino no existe';
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message =
      'Ha ocurrido un error durante la recuperación del vecino';
    response.data = error;
    return response;
  }
}

async function edit(neighborID) {
  try {
    const response = await getNeighbor(neighborID);
    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.data = error;
    return response;
  }
}

async function update(_neighbor) {
  try {
    const response = await getNeighbor(_neighbor.id);

    if (!response.data) {
      response.message = 'Este vecino no existe';
    } else {
      const result_house = await findHouseByNumber(_neighbor.houseNumber);

      if (!result_house.data) {
        House.create({
          house_no: _neighbor.houseNumber,
          street: _neighbor.street
        });
      } else {
        House.update(
          {
            street: _neighbor.street
          },
          {
            where: {
              house_no: {
                [Op.eq]: [_neighbor.houseNumber]
              }
            }
          }
        );
      }

      const result = await Neighbor.update(
        {
          dni: _neighbor.dni,
          fullname: _neighbor.fullName,
          phone_number: _neighbor.phoneNumber,
          email_address: _neighbor.email,
          house_no: _neighbor.houseNumber
        },
        {
          where: {
            id: {
              [Op.eq]: [_neighbor.id]
            }
          }
        }
      );

      if (result[0] === 1) {
        response.status = 1;
        response.message = 'Registro actualizado con exito';
        response.data = _neighbor;
      }
    }

    return response;
  } catch (error) {
    response.status = 0;

    if (error instanceof UniqueConstraintError) {
      console.log(error);
      response.message = 'Esta insertando un vecino cuya cedula ya existe';
    } else {
      response.message =
        'Ha ocurrido un error durante el registro en la base de datos';
    }

    response.data = error;

    return response;
  }
}

async function create(_neighbor) {
  try {
    const result = await findHouseByNumber(_neighbor.houseNumber);

    if (!result.data) {
      House.create({
        house_no: _neighbor.houseNumber,
        street: _neighbor.street
      });
    }

    const neighbor_attributes = {
      dni: _neighbor.dni,
      fullname: _neighbor.fullName,
      phone_number: _neighbor.phoneNumber,
      email_address: _neighbor.email,
      house_no: _neighbor.houseNumber
    };

    const neighbor = Neighbor.create(neighbor_attributes);

    if (neighbor) {
      response.message = 'Vecino creado con exito';
      response.data = neighbor.dataValues;
    } else {
      response.message = 'Registro del vecino ha fallado';
      response.data = null;
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;

    if (error instanceof UniqueConstraintError) {
      console.log(error);
      response.message = 'Esta insertando un vecino cuya cedula ya existe';
    } else {
      response.message =
        'Ha ocurrido un error durante el registro en la base de datos';
    }

    response.data = error;
    return response;
  }
}

module.exports = {
  findByDNI,
  create,
  edit,
  update,
  getNeighbors,
  getNeighborsCount
};
