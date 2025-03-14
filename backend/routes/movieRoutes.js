const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

/**
 * @route GET /api/movies
 * @desc Obtener todas las películas activas
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Aplicar filtros opcionales
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    if (req.query.genre) {
      filters.genre = req.query.genre;
    }
    
    if (req.query.limit) {
      filters.limit = req.query.limit;
    }
    
    if (req.query.page) {
      filters.page = req.query.page;
    }
    
    const result = await movieController.getMovies(filters);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener películas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/movies/:id
 * @desc Obtener detalles de una película por ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const movie = await movieController.getMovieById(req.params.id);
    res.json(movie);
  } catch (error) {
    console.error('Error al obtener detalles de película:', error);
    
    if (error.message === 'Película no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/movies/sync
 * @desc Sincronizar películas desde TMDB
 * @access Private (debería tener autenticación de admin)
 */
router.post('/sync', async (req, res) => {
  try {
    const maxPages = req.body.pages || 5;
    const result = await movieController.syncMovies(maxPages);
    res.json(result);
  } catch (error) {
    console.error('Error al sincronizar películas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/movies/:id/status
 * @desc Actualizar estado (activo/inactivo) de una película
 * @access Private (debería tener autenticación de admin)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'El valor "active" debe ser un booleano' });
    }
    
    const movie = await movieController.updateMovieStatus(req.params.id, active);
    res.json(movie);
  } catch (error) {
    console.error('Error al actualizar estado de película:', error);
    
    if (error.message === 'Película no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;