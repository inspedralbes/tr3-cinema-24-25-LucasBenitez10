const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');

/**
 * @route GET /api/screenings
 * @desc Obtener todas las funciones
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Aplicar filtros
    if (req.query.movieId) {
      filters.movie = req.query.movieId;
    }
    
    if (req.query.roomId) {
      filters.room = req.query.roomId;
    }
    
    if (req.query.date) {
      filters.date = req.query.date;
    }
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    const screenings = await screeningController.getScreenings(filters);
    res.json(screenings);
  } catch (error) {
    console.error('Error al obtener funciones:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/screenings/movie/:movieId
 * @desc Obtener funciones disponibles para una película específica
 * @access Public
 */
router.get('/movie/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;
    let startDate;
    
    if (req.query.date) {
      startDate = new Date(req.query.date);
    } else {
      startDate = new Date();
    }
    
    const screenings = await screeningController.getScreeningsByMovie(movieId, startDate);
    res.json(screenings);
  } catch (error) {
    console.error('Error al obtener funciones por película:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/screenings/:id
 * @desc Obtener detalles de una función
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const screening = await screeningController.getScreeningById(req.params.id);
    
    if (!screening) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }
    
    res.json(screening);
  } catch (error) {
    console.error('Error al obtener detalles de función:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/screenings
 * @desc Crear una nueva función
 * @access Private (debería tener autenticación de admin)
 */
router.post('/', async (req, res) => {
  try {
    const {
      movieId,
      roomId,
      date,
      startTime,
      priceRegular,
      priceVIP,
      language,
      format
    } = req.body;
    
    // Validaciones básicas
    if (!movieId || !roomId || !date || !startTime || !priceRegular) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos' 
      });
    }
    
    const screeningData = {
      movieId,
      roomId,
      date,
      startTime,
      priceRegular,
      priceVIP,
      language,
      format
    };
    
    const newScreening = await screeningController.createScreening(screeningData);
    res.status(201).json(newScreening);
  } catch (error) {
    console.error('Error al crear función:', error);
    
    if (error.message === 'Película no encontrada' || error.message === 'Sala no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('sala ya tiene una función programada')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/screenings/:id/status
 * @desc Actualizar estado de una función
 * @access Private (debería tener autenticación de admin)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }
    
    const updatedScreening = await screeningController.updateScreeningStatus(
      req.params.id,
      status
    );
    
    res.json(updatedScreening);
  } catch (error) {
    console.error('Error al actualizar estado de función:', error);
    
    if (error.message === 'Función no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Estado no válido') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;