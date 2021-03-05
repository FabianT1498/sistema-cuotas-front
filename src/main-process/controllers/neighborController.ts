import { TYPED_NULL_EXPR } from '@angular/compiler/src/output/output_ast';

export {};

const models = require('../database/models/index');

const { UniqueConstraintError, Sequelize } = require('sequelize');

const paginate = require('../helpers/paginate');

const Neighbor = models.Neighbor;
const House = models.House;

const response = {
  status: 1,
  message: '',
  data: null
};

const Op = Sequelize.Op;

async function getNeighborsCount() {
  try {
    const result = await Neighbor.count();
    console.log(result);
    return { status: 1, message: 'Total de vecinos', data: result };
  } catch (error) {
    console.log(error);
    return {
      status: 0,
      message: 'Ha ocurrido un error',
      data: null
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
      status: 1,
      message: 'Vecinos encontrados',
      data: result.map(el => el.dataValues)
    };
  } catch (error) {
    console.log(error);
    return {
      status: 0,
      message: 'Ha ocurrido un error durante la recuperación de los vecinos',
      data: null
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
    const house = await House.findOne({
      where: {
        house_no: house_no
      }
    });

    console.log(house);

    if (house) {
      response.status = 1;
      response.message = 'Casa encontrada';
      response.data = house.dataValues;
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
    if (neighborID === -1) {
      response.data = null;
      response.message = 'Por favor, envíe un ID valido';
      response.status = 0;
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
      response.status = 1;
      response.message = 'Vecino encontrado';
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
      response.status = 0;
      response.message = 'Vecino no existe';
      response.data = null;
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;
    response.message =
      'Ha ocurrido un error durante la recuperación del vecino';
    response.data = null;
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
    response.message = error;
    response.data = null;
    return response;
  }
}

async function update(_neighbor) {
  try {
    const neighbor_result = await getNeighbor(_neighbor.id);

    let house_result = null;

    if (!neighbor_result.data) {
      response.status = 0;
      response.data = null;
      response.message = 'Este vecino no existe';
    } else {
      house_result = await findHouseByNumber(_neighbor.houseNumber);

      console.log(house_result);

      if (!house_result.data) {
        await House.create({
          house_no: _neighbor.houseNumber,
          street: _neighbor.street
        });
      } else {
        await House.update(
          {
            street: _neighbor.street
          },
          {
            where: {
              house_no: house_result.data.house_no
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
            id: _neighbor.id
          }
        }
      );

      if (result[0] === 1) {
        response.status = 1;
        response.message = 'Registro actualizado con exito';
        response.data = _neighbor;
      } else {
        response.status = 0;
        response.message = 'Ha ocurrido un problema al actualizar el vecino';
        response.data = null;
      }
    }

    return response;
  } catch (error) {
    response.status = 0;
    console.log(error);

    if (error instanceof UniqueConstraintError) {
      response.message = 'Esta insertando un vecino cuya cedula ya existe';
    } else {
      response.message =
        'Ha ocurrido un error durante el registro en la base de datos';
    }

    response.data = null;

    return response;
  }
}

async function create(_neighbor) {
  try {
    const house_result = await findHouseByNumber(_neighbor.houseNumber);

    if (!house_result.data) {
      await House.create({
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

    const neighbor = await Neighbor.create(neighbor_attributes);

    if (neighbor) {
      response.status = 1;
      response.message = 'Vecino creado con exito';
      response.data = neighbor.dataValues;
    } else {
      response.status = 0;
      response.message = 'Registro del vecino ha fallado';
      response.data = null;
    }

    return response;
  } catch (error) {
    console.log(error);
    response.status = 0;

    if (error instanceof UniqueConstraintError) {
      response.message = 'Esta insertando datos que ya existen';
    } else {
      response.message =
        'Ha ocurrido un error durante el registro en la base de datos';
    }

    response.data = null;

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
