const express = require('express');
const router = express.Router();
const ticketTypeController = require('../controllers/ticketTypeController');

// Rutas públicas
router.get('/', ticketTypeController.getAllActiveTicketTypes);
router.get('/movie/:movieId', ticketTypeController.getTicketTypesForMovie);
router.get('/:id', ticketTypeController.getTicketTypeById);

// Rutas de administrador (sin protección por ahora)
// NOTA: Se recomienda añadir protección a estas rutas más adelante
router.get('/admin/all', ticketTypeController.getAllTicketTypes);
router.post('/', ticketTypeController.createTicketType);
router.put('/:id', ticketTypeController.updateTicketType);
router.patch('/:id/deactivate', ticketTypeController.deactivateTicketType);

module.exports = router;