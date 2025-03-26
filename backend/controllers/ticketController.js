const Ticket = require('../models/Ticket');
const Screening = require('../models/Screening');
const TicketType = require('../models/TicketType');
const crypto = require('crypto');

/**
 * Genera un código único para el ticket
 * @returns {String} Código único del ticket
 */
const generateTicketCode = () => {
  // Generar un string aleatorio de 8 caracteres
  const randomBytes = crypto.randomBytes(4);
  const timestamp = Date.now().toString(36);
  return `${randomBytes.toString('hex').toUpperCase()}-${timestamp}`;
};

/**
 * Compra tickets para una función
 * @param {Object} ticketData - Datos de los tickets a comprar
 * @returns {Promise<Array>} Array de tickets creados
 */
const purchaseTickets = async (ticketData) => {
  try {
    const { screeningId, customerInfo, seats, paymentMethod } = ticketData;

    // Verificar que la función exista y tenga asientos disponibles
    const screening = await Screening.findById(screeningId);
    if (!screening) throw new Error('Función no encontrada');

    if (screening.availableSeats < seats.length) {
      throw new Error('No hay suficientes asientos disponibles');
    }

    if (screening.status !== 'scheduled') {
      throw new Error('No se pueden comprar boletos para esta función');
    }

    // Crear tickets individuales para cada asiento
    const tickets = [];
    const ticketCode = generateTicketCode(); // Código base que se puede modificar para cada ticket

    for (const seat of seats) {
      // Verificar si el asiento ya está ocupado
      const seatIdentifier = `${seat.row}${seat.number}`;
      const existingTicket = await Ticket.findOne({
        screening: screeningId,
        'seats.row': seat.row,
        'seats.number': seat.number
      });

      if (existingTicket) {
        throw new Error(`El asiento ${seatIdentifier} ya está ocupado`);
      }

      // Buscar el tipo de ticket para obtener el ObjectId
      let ticketTypeId;
      let ticketTypeCode = seat.type || 'normal';
      let pricePaid = seat.price || screening.priceRegular;

      try {
        // Intentar encontrar el tipo de ticket por código
        const ticketTypeDoc = await TicketType.findOne({ code: ticketTypeCode });
        
        if (ticketTypeDoc) {
          ticketTypeId = ticketTypeDoc._id;
          
          // Si no se especificó un precio, usar el del tipo de ticket
          if (!seat.price) {
            // Verificar si hay un precio especial para esta película
            pricePaid = ticketTypeDoc.getPriceForMovie(screening.movie) || ticketTypeDoc.price;
          }
        } else {
          console.warn(`Tipo de ticket "${ticketTypeCode}" no encontrado. Buscando uno predeterminado.`);
          // Si no se encuentra, intentar usar uno predeterminado
          const defaultTicketType = await TicketType.findOne({ code: 'normal' });
          
          if (defaultTicketType) {
            ticketTypeId = defaultTicketType._id;
            ticketTypeCode = 'normal';
            pricePaid = defaultTicketType.price;
          } else {
            throw new Error(`No se pudo encontrar un tipo de ticket válido para "${ticketTypeCode}"`);
          }
        }
      } catch (ticketTypeError) {
        console.error('Error al buscar tipo de ticket:', ticketTypeError);
        throw new Error(`Error al buscar tipo de ticket: ${ticketTypeError.message}`);
      }

      // Crear un nuevo ticket para este asiento
      const ticketIndividual = {
        ticketCode: `${ticketCode}-${seatIdentifier}`, // Código único para cada ticket
        screening: screeningId,
        ticketType: ticketTypeId, // ObjectId del tipo de ticket
        ticketTypeCode, // Código del tipo de ticket (string)
        seats: {
          row: seat.row,
          number: seat.number
        },
        customerInfo: customerInfo,
        pricePaid: pricePaid, // Precio individual del asiento
        status: 'active', // Estado predeterminado
        paymentMethod: paymentMethod?.type || 'credit_card'
      };

      // Si se proporciona un usuario, asignarlo
      if (ticketData.user) {
        ticketIndividual.user = ticketData.user;
      }

      console.log('Creando ticket con datos:', ticketIndividual);

      // Crear el ticket en la base de datos
      const createdTicket = await Ticket.create(ticketIndividual);
      tickets.push(createdTicket);
    }

    // Actualizar asientos disponibles en la función
    await Screening.updateOne(
      { _id: screeningId },
      { $inc: { availableSeats: -seats.length } }
    );

    return tickets;
  } catch (error) {
    console.error('Error al comprar tickets:', error);
    throw error;
  }
};

/**
 * Obtiene los tickets para una función específica
 * @param {String} screeningId - ID de la función
 * @returns {Promise<Array>} Lista de tickets
 */
const getTicketsByScreening = async (screeningId) => {
  try {
    const tickets = await Ticket.find({ screening: screeningId })
      .populate({
        path: 'screening',
        populate: {
          path: 'movie room',
          select: 'title name'
        }
      })
      .populate('ticketType');

    return tickets;
  } catch (error) {
    console.error('Error al obtener tickets por función:', error);
    throw error;
  }
};

/**
 * Obtiene los tickets comprados por un cliente
 * @param {String} email - Email del cliente
 * @returns {Promise<Array>} Lista de tickets
 */
const getTicketsByCustomer = async (email) => {
  try {
    const tickets = await Ticket.find({ 'customerInfo.email': email })
      .populate({
        path: 'screening',
        populate: {
          path: 'movie room',
          select: 'title name poster_path startTime date'
        }
      })
      .populate('ticketType')
      .sort({ createdAt: -1 });

    return tickets;
  } catch (error) {
    console.error('Error al obtener tickets por cliente:', error);
    throw error;
  }
};

/**
 * Verifica un ticket por su código
 * @param {String} ticketCode - Código único del ticket
 * @returns {Promise<Object>} Información del ticket
 */
const verifyTicket = async (ticketCode) => {
  try {
    const ticket = await Ticket.findOne({ ticketCode })
      .populate({
        path: 'screening',
        populate: {
          path: 'movie room',
          select: 'title name'
        }
      })
      .populate('ticketType');

    if (!ticket) {
      throw new Error('Ticket no encontrado o inválido');
    }

    return ticket;
  } catch (error) {
    console.error('Error al verificar ticket:', error);
    throw error;
  }
};

/**
 * Cancela un ticket y actualiza la disponibilidad de asientos
 * @param {String} ticketId - ID del ticket
 * @returns {Promise<Object>} Ticket cancelado
 */
const cancelTicket = async (ticketId) => {
  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    if (ticket.status === 'cancelled') {
      throw new Error('Este ticket ya ha sido cancelado');
    }

    // Obtener la función para verificar si aún es posible cancelar
    const screening = await Screening.findById(ticket.screening);

    if (!screening) {
      throw new Error('Función no encontrada');
    }

    // Verificar si la función ya ocurrió o está por comenzar
    const now = new Date();
    const screeningDate = new Date(screening.date);
    const [hours, minutes] = screening.startTime.split(':').map(Number);
    screeningDate.setHours(hours, minutes, 0);

    // Si faltan menos de 2 horas para la función, no permitir cancelación
    const hoursUntilScreening = (screeningDate - now) / (1000 * 60 * 60);

    if (hoursUntilScreening < 2) {
      throw new Error('No se puede cancelar el ticket cuando faltan menos de 2 horas para la función');
    }

    // Actualizar el ticket
    ticket.status = 'cancelled';
    await ticket.save();

    // Actualizar disponibilidad de asientos
    await Screening.updateOne(
      { _id: screening._id },
      { $inc: { availableSeats: 1 } }
    );

    return ticket;
  } catch (error) {
    console.error('Error al cancelar ticket:', error);
    throw error;
  }
};

module.exports = {
  purchaseTickets,
  getTicketsByScreening,
  getTicketsByCustomer,
  verifyTicket,
  cancelTicket
};