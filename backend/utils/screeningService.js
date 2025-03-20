// utils/screeningService.js
const Showtime = require('../models/Showtime');
const Screening = require('../models/Screening');
const Room = require('../models/Room'); // Ajusta la ruta según tu estructura

/**
 * Crea una nueva función de cine utilizando un horario predefinido
 * @param {Object} screeningData - Datos básicos de la función
 * @param {string} screeningData.movieId - ID de la película
 * @param {string} screeningData.roomId - ID de la sala
 * @param {Date} screeningData.date - Fecha de la función
 * @param {number} screeningData.priceRegular - Precio regular
 * @param {string} screeningData.language - Idioma ('original', 'dubbed', 'subtitled')
 * @returns {Promise<Object>} La nueva función creada
 */
const scheduleScreening = async (screeningData) => {
  try {
    const { movieId, roomId, date, priceRegular, language = 'subtitled' } = screeningData;
    
    if (!movieId || !roomId || !date || !priceRegular) {
      throw new Error('Faltan datos requeridos para programar la función');
    }
    
    // Convertir la fecha a objeto Date si viene como string
    const screeningDate = new Date(date);
    
    // Obtener el día de la semana (0-6)
    const dayOfWeek = screeningDate.getDay();
    
    // Buscar horarios disponibles para esta sala en este día
    const availableShowtimes = await Showtime.find({
      theaterId: roomId,
      dayOfWeek: dayOfWeek,
      isAvailable: true
    }).sort({ startTime: 1 });
    
    if (availableShowtimes.length === 0) {
      throw new Error(`No hay horarios disponibles para esta sala en ${getDayName(dayOfWeek)}`);
    }
    
    // Obtener información de la sala
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Sala no encontrada');
    }
    
    // Verificar funciones ya programadas ese día para evitar conflictos
    const existingScreenings = await Screening.find({
      room: roomId,
      date: {
        $gte: new Date(screeningDate.setHours(0, 0, 0, 0)),
        $lt: new Date(screeningDate.setHours(23, 59, 59, 999))
      }
    }).select('startTime');
    
    // Extraer los horarios que ya están ocupados
    const occupiedTimes = existingScreenings.map(screening => screening.startTime);
    
    // Filtrar los horarios disponibles que no estén ocupados
    const availableTimes = availableShowtimes.filter(
      showtime => !occupiedTimes.includes(showtime.startTime)
    );
    
    if (availableTimes.length === 0) {
      throw new Error('Todos los horarios para este día ya están ocupados');
    }
    
    // Crear la nueva función con el primer horario disponible
    const selectedShowtime = availableTimes[0];
    
    const newScreening = await Screening.create({
      movie: movieId,
      room: roomId,
      showtime: selectedShowtime._id,
      date: screeningDate,
      startTime: selectedShowtime.startTime,
      priceRegular,
      language,
      availableSeats: room.capacity
    });
    
    return newScreening;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los horarios disponibles para una sala en una fecha específica
 * @param {string} roomId - ID de la sala
 * @param {Date} date - Fecha para consultar disponibilidad
 * @returns {Promise<Array>} Lista de horarios disponibles
 */
const getAvailableTimesForDate = async (roomId, date) => {
  try {
    // Convertir la fecha a objeto Date si viene como string
    const screeningDate = new Date(date);
    
    // Obtener el día de la semana (0-6)
    const dayOfWeek = screeningDate.getDay();
    
    // Buscar horarios predefinidos para este día
    const showtimes = await Showtime.find({
      theaterId: roomId,
      dayOfWeek: dayOfWeek,
      isAvailable: true
    }).sort({ startTime: 1 });
    
    // Buscar funciones ya programadas para ese día
    const existingScreenings = await Screening.find({
      room: roomId,
      date: {
        $gte: new Date(screeningDate.setHours(0, 0, 0, 0)),
        $lt: new Date(screeningDate.setHours(23, 59, 59, 999))
      }
    }).select('startTime');
    
    // Extraer los horarios que ya están ocupados
    const occupiedTimes = existingScreenings.map(screening => screening.startTime);
    
    // Filtrar los horarios disponibles
    const availableTimes = showtimes.filter(
      showtime => !occupiedTimes.includes(showtime.startTime)
    );
    
    return availableTimes;
  } catch (error) {
    throw error;
  }
};

// Función auxiliar para obtener el nombre del día
const getDayName = (dayNumber) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber] || 'Día desconocido';
};

module.exports = {
  scheduleScreening,
  getAvailableTimesForDate
};