const Movie = require('../models/Movie');
const tmdbController = require('./tmdbController');

/**
 * Obtiene todas las películas activas
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de películas
 */
const getMovies = async (filters = {}) => {
  try {
    const query = { active: true, ...filters };
    
    // Si hay filtro de texto
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    // Si hay filtro de género
    if (filters.genre) {
      query.genre_ids = { $in: [parseInt(filters.genre)] };
    }
    
    const options = {
      sort: { popularity: -1 },
      limit: filters.limit ? parseInt(filters.limit) : 20,
      skip: filters.page ? (parseInt(filters.page) - 1) * 20 : 0
    };
    
    const movies = await Movie.find(query, null, options);
    const total = await Movie.countDocuments(query);
    
    return {
      movies,
      page: filters.page ? parseInt(filters.page) : 1,
      total,
      pages: Math.ceil(total / (filters.limit ? parseInt(filters.limit) : 20))
    };
  } catch (error) {
    console.error('Error al obtener películas:', error);
    throw error;
  }
};

/**
 * Obtiene detalles de una película
 * @param {String} movieId - ID de la película
 * @returns {Promise<Object>} Detalles de la película
 */
const getMovieById = async (movieId) => {
  try {
    const movie = await Movie.findById(movieId);
    
    if (!movie) {
      throw new Error('Película no encontrada');
    }
    
    return movie;
  } catch (error) {
    console.error('Error al obtener detalles de película:', error);
    throw error;
  }
};

/**
 * Actualiza el estado activo de una película
 * @param {String} movieId - ID de la película
 * @param {Boolean} active - Estado activo
 * @returns {Promise<Object>} Película actualizada
 */
const updateMovieStatus = async (movieId, active) => {
  try {
    if (typeof active !== 'boolean') {
      throw new Error('El valor "active" debe ser un booleano');
    }
    
    const movie = await Movie.findByIdAndUpdate(
      movieId,
      { active },
      { new: true }
    );
    
    if (!movie) {
      throw new Error('Película no encontrada');
    }
    
    return movie;
  } catch (error) {
    console.error('Error al actualizar estado de película:', error);
    throw error;
  }
};

/**
 * Sincroniza películas con TMDB
 * @returns {Promise<Object>} Resultado de la sincronización
 */
const syncMovies = async () => {
  try {
    const result = await tmdbController.syncMoviesToDatabase();
    return result;
  } catch (error) {
    console.error('Error al sincronizar películas:', error);
    throw error;
  }
};

module.exports = {
  getMovies,
  getMovieById,
  updateMovieStatus,
  syncMovies
};