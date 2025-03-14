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
    const {
      screeningId,
      customerInfo,
      seats,
      ticketType,
      paymentMethod
    } = req.body;
    
    // Validaciones básicas
    if (!screeningId || !customerInfo || !seats || !seats.length) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos' 
      });
    }
    
    // Validar información del cliente
    if (!customerInfo.email) {
      return res.status(400).json({ 
        error: 'El email del cliente es requerido' 
      });
    }
    
    const ticketData = {
      screeningId,
      customerInfo,
      seats,
      ticketType: ticketType || 'regular',
      paymentMethod
    };
    
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