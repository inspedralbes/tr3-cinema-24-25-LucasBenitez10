const Screening = require('../models/Screening');
const Movie = require('../models/Movie');
const Room = require('../models/Room');

/**
 * Crea una nueva función/proyección
 * @param {Object} screeningData - Datos de la función a crear
 * @returns {Promise<Object>} La función creada
 */
const createScreening = async (screeningData) => {
  try {
    const { movieId, roomId, date, startTime, priceRegular, priceVIP, language, format } = screeningData;
    
    // Verificar que la película y la sala existan
    const movie = await Movie.findById(movieId);
    if (!movie) throw new Error('Película no encontrada');
    
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Sala no encontrada');
    
    // Calcular hora de finalización basada en la duración de la película
    const [hours, minutes] = startTime.split(':').map(Number);
    const screeningDate = new Date(date);
    screeningDate.setHours(hours, minutes, 0);
    
    const endDate = new Date(screeningDate);
    endDate.setMinutes(endDate.getMinutes() + movie.duration);
    
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    
    // Verificar disponibilidad de la sala en ese horario
    const conflictingScreening = await Screening.findOne({
      room: roomId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59)
      },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    if (conflictingScreening) {
      throw new Error('La sala ya tiene una función programada en ese horario');
    }
    
    // Crear la nueva función
    const newScreening = await Screening.create({
      movie: movieId,
      room: roomId,
      date: screeningDate,
      startTime,
      endTime,
      priceRegular,
      priceVIP: priceVIP || priceRegular * 1.5, // Si no se proporciona, 50% más que regular
      language,
      format,
      availableSeats: room.capacity,
      status: 'scheduled'
    });
    
    return newScreening;
  } catch (error) {
    console.error('Error al crear función:', error);
    throw error;
  }
};

/**
 * Obtiene todas las funciones activas
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de funciones
 */
const getScreenings = async (filters = {}) => {
  try {
    const query = { status: { $ne: 'cancelled' }, ...filters };
    
    // Si hay filtro de fecha
    if (filters.date) {
      const date = new Date(filters.date);
      query.date = {
        $gte: new Date(date).setHours(0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59)
      };
    }
    
    const screenings = await Screening.find(query)
      .populate('movie', 'title poster_path duration')
      .populate('room', 'name capacity')
      .sort({ date: 1, startTime: 1 });
    
    return screenings;
  } catch (error) {
    console.error('Error al obtener funciones:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una función
 * @param {String} screeningId - ID de la función
 * @param {String} newStatus - Nuevo estado
 * @returns {Promise<Object>} La función actualizada
 */
const updateScreeningStatus = async (screeningId, newStatus) => {
  try {
    const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado no válido');
    }
    
    const updatedScreening = await Screening.findByIdAndUpdate(
      screeningId, 
      { status: newStatus },
      { new: true }
    );
    
    if (!updatedScreening) {
      throw new Error('Función no encontrada');
    }
    
    return updatedScreening;
  } catch (error) {
    console.error('Error al actualizar estado de la función:', error);
    throw error;
  }
};

module.exports = {
  createScreening,
  getScreenings,
  updateScreeningStatus
};