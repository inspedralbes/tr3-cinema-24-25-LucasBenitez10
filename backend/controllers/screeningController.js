// controllers/screeningController.js
const Screening = require('../models/Screening');
const { scheduleScreening, getAvailableTimesForDate } = require('../utils/screeningService');

/**
 * Obtiene todas las funciones programadas
 */
const getAllScreenings = async () => {
  return await Screening.find()
    .populate({
      path: 'movie',
      select: 'title duration tmdbId overview poster_path release_date vote_average genre_ids original_title trailer active'
    })
    .populate('room', 'name capacity hasVIP')
    .sort({ date: 1, startTime: 1 });
};

/**
 * Obtiene funciones para una película específica
 */
const getScreeningsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const screenings = await Screening.find({ movie: movieId })
      .populate('room', 'name capacity hasVIP')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, data: screenings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtiene funciones para una fecha específica
 */
const getScreeningsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Convertir la fecha a objeto Date
    const screeningDate = new Date(date);

    // Buscar funciones para esta fecha
    const screenings = await Screening.find({
      date: {
        $gte: new Date(screeningDate.setHours(0, 0, 0, 0)),
        $lt: new Date(screeningDate.setHours(23, 59, 59, 999))
      }
    })
      .populate('movie', 'title duration posterUrl')
      .populate('room', 'name capacity hasVIP')
      .sort({ startTime: 1 });

    res.status(200).json({ success: true, data: screenings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Crea una nueva función basada en un horario disponible
 */
const createScreening = async (req, res) => {
  try {
    const { movieId, roomId, date, startTime, endTime, priceRegular, language } = req.body;

    const newScreening = await scheduleScreening({
      movieId,
      roomId,
      date,
      startTime,
      endTime,
      priceRegular,
      language
    });

    res.status(201).json({
      success: true,
      message: 'Función programada exitosamente',
      data: newScreening
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Obtiene los horarios disponibles para una sala en una fecha
 */
const getAvailableTimes = async (req, res) => {
  try {
    const { roomId, date } = req.params;

    const availableTimes = await getAvailableTimesForDate(roomId, date);

    res.status(200).json({
      success: true,
      data: availableTimes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancela una función programada
 */
const cancelScreening = async (req, res) => {
  try {
    const { id } = req.params;

    const screening = await Screening.findById(id);

    if (!screening) {
      return res.status(404).json({ success: false, message: 'Función no encontrada' });
    }

    screening.status = 'cancelled';
    await screening.save();

    res.status(200).json({
      success: true,
      message: 'Función cancelada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Obtiene funciones con filtros aplicados
 */
const getScreenings = async (filters) => {
  try {
    let query = {};

    if (filters.movie) query.movie = filters.movie;
    if (filters.room) query.room = filters.room;

    if (filters.date) {
      const date = new Date(filters.date);
      query.date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    if (filters.status) query.status = filters.status;

    const screenings = await Screening.find(query)
      .populate('movie', 'title poster_path duration posterUrl')
      .populate('room', 'name capacity hasVIP')
      .sort({ date: 1, startTime: 1 });

    return screenings;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Obtiene una función por su ID
 */
const getScreeningById = async (id) => {
  try {
    const screening = await Screening.findById(id)
      .populate('movie', 'title duration posterUrl')
      .populate('room', 'name capacity hasVIP');

    if (!screening) {
      throw new Error('Función no encontrada');
    }

    return screening;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Actualiza el estado de una función
 */
const updateScreeningStatus = async (id, status) => {
  try {
    const validStatuses = ['active', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      throw new Error('Estado no válido');
    }

    const screening = await Screening.findById(id);

    if (!screening) {
      throw new Error('Función no encontrada');
    }

    screening.status = status;
    await screening.save();

    return screening;
  } catch (error) {
    throw new Error(error.message);
  }
};


const deleteScreening = async (req, res) => {
  try {
    const { id } = req.params;

    // Corregido: la variable se llamaba deleteScreening, pero luego se usa deletedScreening
    const deletedScreening = await Screening.findByIdAndDelete(id);

    if (!deletedScreening) {
      return res.status(404).json({
        success: false,
        message: 'Screening not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sesión eliminada correctamente',
      data: deletedScreening
    });

  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la sesión',
      error: error.message
    });
  }
};

module.exports = {
  getAllScreenings,
  getScreeningsByMovie,
  getScreeningsByDate,
  createScreening,
  getAvailableTimes,
  cancelScreening,
  getScreenings,
  getScreeningById,
  updateScreeningStatus,
  deleteScreening
};