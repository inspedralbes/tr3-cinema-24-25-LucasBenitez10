const express = require('express');
const router = express.Router();
const {
  getAllScreenings,
  getScreeningsByMovie,
  getScreeningsByDate,
  createScreening,
  getAvailableTimes,
  cancelScreening,
  getScreenings,
  deleteScreening
} = require('../controllers/screeningController');

/**
 * @route GET /api/screenings
 * @desc Obtener todas las funciones
 * @access Public
 */

router.get('/', async (req, res) => {
  try {
    const screenings = await getAllScreenings();
    res.status(200).json({ success: true, data: screenings });
  } catch (error) {
    console.error('Error en peticion: ', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

router.get('/filters', async (req, res) => {
  try {
    const filters = {};

    // Extraer los filtros desde query parameters
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

    // Llamar a la función getScreenings con los filtros
    const screenings = await getScreenings(filters);

    // Devolver la respuesta en el mismo formato que las otras rutas
    res.status(200).json({
      success: true,
      data: screenings
    });
  } catch (error) {
    console.error('Error al filtrar proyecciones:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al filtrar proyecciones'
    });
  }
});
router.get('/movie/:movieId', getScreeningsByMovie);
router.get('/date/:date', getScreeningsByDate);
router.post('/', createScreening);
router.get('/available-times/:roomId/:date', getAvailableTimes);
router.put('/cancel/:id', cancelScreening);
router.delete('/delete/:id', deleteScreening);

module.exports = router;