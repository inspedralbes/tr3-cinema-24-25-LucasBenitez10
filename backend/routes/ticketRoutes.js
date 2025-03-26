const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

/**
 * @route POST /api/tickets
 * @desc Comprar tickets para una función
 * @access Public (debería tener autenticación de usuario)
 */
router.post('/', async (req, res) => {
  try {
    // Adaptamos el formato de los datos que recibimos
    const ticketData = req.body;

    // Verifica si los datos vienen en el formato del frontend o del backend
    // y haz las adaptaciones necesarias
    if (ticketData.screening && !ticketData.screeningId) {
      ticketData.screeningId = ticketData.screening;
    }

    // Verificamos que tengamos toda la información necesaria
    if (!ticketData.screeningId && !ticketData.screening) {
      return res.status(400).json({ error: 'El ID de la proyección es requerido' });
    }

    if (!ticketData.customerInfo || !ticketData.customerInfo.email) {
      return res.status(400).json({ error: 'La información del cliente con email es requerida' });
    }

    // Verificamos si seats viene como un objeto único o como array
    if (ticketData.seats && !Array.isArray(ticketData.seats)) {
      // Convertir a array si viene como objeto único
      ticketData.seats = [ticketData.seats];
    }

    if (!ticketData.seats || !ticketData.seats.length) {
      return res.status(400).json({ error: 'Al menos un asiento es requerido' });
    }

    // Adaptamos paymentMethod si viene como string
    if (typeof ticketData.paymentMethod === 'string') {
      ticketData.paymentMethod = { type: ticketData.paymentMethod };
    }

    // Ahora pasamos los datos al controlador
    const tickets = await ticketController.purchaseTickets(ticketData);
    res.status(201).json(tickets);
  } catch (error) {
    console.error('Error al comprar tickets:', error);
    
    if (error.message === 'Función no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('No hay suficientes asientos disponibles') ||
        error.message.includes('No se pueden comprar boletos para esta función') ||
        error.message.includes('El asiento') && error.message.includes('ya está ocupado')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Resto de rutas sin cambios...

/**
 * @route GET /api/tickets/screening/:screeningId
 * @desc Obtener tickets por función
 * @access Private (debería tener autenticación de admin)
 */
router.get('/screening/:screeningId', async (req, res) => {
  try {
    const tickets = await ticketController.getTicketsByScreening(
      req.params.screeningId
    );
    
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets por función:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tickets/customer/:email
 * @desc Obtener tickets por cliente
 * @access Private (debería tener autenticación de usuario)
 */
router.get('/customer/:email', async (req, res) => {
  try {
    const tickets = await ticketController.getTicketsByCustomer(
      req.params.email
    );
    
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets por cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/tickets/verify/:ticketCode
 * @desc Verificar un ticket por su código
 * @access Public (para escaneo en la entrada)
 */
router.get('/verify/:ticketCode', async (req, res) => {
  try {
    const ticket = await ticketController.verifyTicket(
      req.params.ticketCode
    );
    
    res.json(ticket);
  } catch (error) {
    console.error('Error al verificar ticket:', error);
    
    if (error.message === 'Ticket no encontrado o inválido') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/tickets/:id/cancel
 * @desc Cancelar un ticket
 * @access Private (debería tener autenticación de usuario)
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const canceledTicket = await ticketController.cancelTicket(
      req.params.id
    );
    
    res.json({
      message: 'Ticket cancelado exitosamente',
      ticket: canceledTicket
    });
  } catch (error) {
    console.error('Error al cancelar ticket:', error);
    
    if (error.message === 'Ticket no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Este ticket ya ha sido cancelado' ||
        error.message.includes('No se puede cancelar el ticket')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;