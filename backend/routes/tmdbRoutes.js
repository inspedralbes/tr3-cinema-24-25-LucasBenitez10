const express = require('express');
const router = express.Router();
const tmdbController = require('../controllers/tmdbController');

/**
 * @route GET /api/tmdb/popular
 * @desc Obtener películas populares
 * @access Public
 */
router.get('/popular', async (req, res) => {
  try {
    const movies = await tmdbController.fetchPopularMovies();
    res.json(movies);
  } catch (error) {
    console.error('Error al obtener películas populares:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tmdb/all
 * @desc Obtener todas las películas populares (con paginación)
 * @access Public
 */
router.get('/all', async (req, res) => {
  try {
    const maxPages = req.query.pages ? parseInt(req.query.pages) : 5;
    const movies = await tmdbController.fetchAllPopularMovies(maxPages);
    res.json(movies);
  } catch (error) {
    console.error('Error al obtener todas las películas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tmdb/details/:movieId
 * @desc Obtener detalles de una película
 * @access Public
 */
router.get('/details/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const details = await tmdbController.fetchMovieDetails(movieId);
    res.json(details);
  } catch (error) {
    console.error('Error al obtener detalles de película:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tmdb/sync
 * @desc Sincronizar películas con la base de datos
 * @access Private (debería tener autenticación)
 */
router.get('/sync', async (req, res) => {
  try {
    const maxPages = req.query.pages ? parseInt(req.query.pages) : 5;
    const result = await tmdbController.syncMoviesToDatabase(maxPages);
    res.json(result);
  } catch (error) {
    console.error('Error al sincronizar películas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tmdb/syncGenres
 * @desc Sincronizar géneros con la base de datos
 * @access Private (debería tener autenticación)
 */
router.get('/syncGenres', async (req, res) => {
  try {
    const genres = await tmdbController.syncGenres();
    res.json(genres);
  } catch (error) {
    console.error('Error al sincronizar géneros:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tmdb/image
 * @desc Obtener URL completa de una imagen
 * @access Public
 */
router.get('/image', async (req, res) => {
  try {
    const path = req.query.path;
    const type = req.query.type || 'poster';
    const size = req.query.size || 'w500';
    
    if (!path) {
      return res.status(400).json({ error: 'El parámetro "path" es requerido' });
    }
    
    const imageUrl = tmdbController.getImageUrl(path, type, size);
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error al obtener URL de imagen:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;