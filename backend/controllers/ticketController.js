const Ticket = require('../models/Ticket');
const Screening = require('../models/Screening');
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
    const { screeningId, customerInfo, seats, ticketType, paymentMethod } = ticketData;

    // Verificar que la función exista y tenga asientos disponibles
    const screening = await Screening.findById(screeningId);
    if (!screening) throw new Error('Función no encontrada');

    if (screening.availableSeats < seats.length) {
      throw new Error('No hay suficientes asientos disponibles');
    }

    if (screening.status !== 'scheduled') {
      throw new Error('No se pueden comprar boletos para esta función');
    }

    // Determinar el precio basado en el tipo de boleto
    let price = screening.priceRegular;
    if (ticketType === 'vip') {
      price = screening.priceVIP;
    } else if (ticketType === 'student' || ticketType === 'senior') {
      price = screening.priceRegular * 0.8; // 20% de descuento
    }

    // En lugar de crear múltiples tickets, crear uno solo con todos los asientos

    // Verificar si alguno de los asientos ya está ocupado
    for (const seat of seats) {
      const seatIdentifier = `${seat.row}${seat.number}`;
      const existingTicket = await Ticket.findOne({
        screening: screeningId,
        'seats': { $elemMatch: { row: seat.row, number: seat.number } }
      });

      if (existingTicket) {
        throw new Error(`El asiento ${seatIdentifier} ya está ocupado`);
      }
    }

    // Generar código único para el boleto
    const ticketCode = generateTicketCode();

    // Crear un solo ticket con todos los asientos
    const ticket = await Ticket.create({
      screening: screeningId,
      customer: customerInfo,
      seats: seats,
      ticketType,
      price: price * seats.length, // Multiplicar el precio por la cantidad de asientos
      paymentStatus: 'completed',
      paymentMethod: paymentMethod.type || 'credit_card',
      ticketCode
    });

    // Actualizar asientos disponibles
    await Screening.updateOne(
      { _id: screeningId },
      { $inc: { availableSeats: -seats.length } }
    );

    return [ticket]; // Devolver array con un solo ticket para mantener compatibilidad
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
      });

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
    const tickets = await Ticket.find({ 'customer.email': email })
      .populate({
        path: 'screening',
        populate: {
          path: 'movie room',
          select: 'title name poster_path startTime date'
        }
      })
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
      });

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

    if (ticket.paymentStatus === 'refunded') {
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
    ticket.paymentStatus = 'refunded';
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