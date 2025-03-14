const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

/**
 * @route GET /api/rooms
 * @desc Obtener todas las salas
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Aplicar filtros opcionales
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    const rooms = await roomController.getRooms(filters);
    res.json(rooms);
  } catch (error) {
    console.error('Error al obtener salas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/rooms
 * @desc Crear una nueva sala
 * @access Private (debería tener autenticación de admin)
 */
router.post('/', async (req, res) => {
  try {
    const { name, capacity, hasVIP, is3D, isIMAX } = req.body;
    
    // Validaciones básicas
    if (!name || !capacity) {
      return res.status(400).json({ 
        error: 'El nombre y la capacidad son requeridos' 
      });
    }
    
    const roomData = { name, capacity, hasVIP, is3D, isIMAX };
    const newRoom = await roomController.createRoom(roomData);
    
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error al crear sala:', error);
    
    // Si es un error de duplicado, devolver un mensaje específico
    if (error.message.includes('Ya existe una sala con el nombre')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/rooms/:id
 * @desc Actualizar una sala existente
 * @access Private (debería tener autenticación de admin)
 */
router.put('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomData = req.body;
    
    const updatedRoom = await roomController.updateRoom(roomId, roomData);
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error al actualizar sala:', error);
    
    if (error.message === 'Sala no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Ya existe una sala con el nombre')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/rooms/:id/status
 * @desc Actualizar estado de una sala
 * @access Private (debería tener autenticación de admin)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }
    
    const updatedRoom = await roomController.updateRoomStatus(roomId, status);
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error al actualizar estado de sala:', error);
    
    if (error.message === 'Sala no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Estado no válido') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('No se puede cambiar el estado porque hay funciones programadas')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;