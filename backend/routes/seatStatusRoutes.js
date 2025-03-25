// routes/seatStatusRoutes.js
const express = require('express');
const router = express.Router();
const SeatStatus = require('../models/seatStatus'); // Asegúrate de que esta ruta coincida con el nombre real del archivo
const Ticket = require('../models/Ticket');

// IMPORTANTE: Cambia el orden de las rutas - Las rutas específicas van ANTES de las rutas con parámetros
// Marcar asientos como ocupados - ESTA RUTA DEBE IR ANTES DE '/:screeningId'
router.post('/mark-occupied', async (req, res) => {
  try {
    const { screeningId, seatIds } = req.body;
    
    console.log('Solicitud para marcar asientos como ocupados:', { screeningId, seatIds });
    
    if (!screeningId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere screeningId y un array de seatIds' 
      });
    }
    
    // Verificar que screeningId es un ObjectId válido
    if (!screeningId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'screeningId no es un ID válido' 
      });
    }

    // Actualizar todos los asientos seleccionados a 'occupied'
    // Arreglo del error "Updating the path 'reservationExpires' would create a conflict"
    const bulkOps = seatIds.map(seatId => ({
      updateOne: {
        filter: { screeningId, seatId },
        update: { 
          $set: { 
            status: 'occupied',
            reservationExpires: null 
          }
        },
        upsert: true // Crear si no existe
      }
    }));
    
    console.log(`Intentando actualizar ${bulkOps.length} asientos a estado 'occupied'`);
    
    const result = await SeatStatus.bulkWrite(bulkOps);
    console.log('Resultado de la actualización:', result);
    
    res.json({ 
      success: true, 
      message: `Asientos marcados como ocupados`,
      result
    });
  } catch (error) {
    console.error('Error en POST /mark-occupied:', error, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reservar asientos temporalmente (para el proceso de compra)
router.post('/reserve', async (req, res) => {
  try {
    const { screeningId, seatIds } = req.body;
    
    if (!screeningId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'screeningId y un array de seatIds son requeridos' });
    }
    
    // Establecer tiempo de expiración (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    // Actualizar o crear estados para los asientos seleccionados
    const updatePromises = seatIds.map(seatId => 
      SeatStatus.findOneAndUpdate(
        { screeningId, seatId, status: { $ne: 'occupied' } },
        { $set: { status: 'reserved', reservationExpires: expiresAt } },
        { new: true, upsert: true }
      )
    );
    
    const results = await Promise.all(updatePromises);
    
    // Verificar si todos los asientos se pudieron reservar
    const allReserved = results.every(result => result && result.status === 'reserved');
    
    if (allReserved) {
      res.json({ success: true, message: 'Asientos reservados temporalmente', seats: results });
    } else {
      // Si algún asiento ya estaba ocupado, liberar los que se reservaron
      const reservedSeatIds = results
        .filter(result => result && result.status === 'reserved')
        .map(seat => seat.seatId);
      
      if (reservedSeatIds.length > 0) {
        await SeatStatus.updateMany(
          { screeningId, seatId: { $in: reservedSeatIds } },
          { $set: { status: 'free', reservationExpires: null } }
        );
      }
      
      res.status(409).json({
        success: false,
        message: 'Algunos asientos ya no están disponibles'
      });
    }
  } catch (error) {
    console.error('Error en POST /reserve:', error);
    res.status(500).json({ message: error.message });
  }
});

// Actualizar el estado de un asiento
router.post('/', async (req, res) => {
  try {
    const { screeningId, seatId, status } = req.body;
    
    if (!screeningId || !seatId || !status) {
      return res.status(400).json({ message: 'screeningId, seatId y status son requeridos' });
    }
    
    const seatStatus = await SeatStatus.findOneAndUpdate(
      { screeningId, seatId },
      { $set: { status } },
      { new: true, upsert: true }
    );
    
    res.json(seatStatus);
  } catch (error) {
    console.error('Error en POST /:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener todos los asientos para una proyección específica - ESTA RUTA DEBE IR ÚLTIMA
router.get('/:screeningId', async (req, res) => {
  try {
    const { screeningId } = req.params;
    
    // Verificamos que el screeningId sea válido
    if (!screeningId) {
      return res.status(400).json({ message: 'screeningId es requerido' });
    }
    
    console.log(`Buscando asientos para la proyección: ${screeningId}`);
    
    // Buscar estados de asientos existentes
    let seatStatuses = await SeatStatus.find({ screeningId });
    console.log(`Encontrados ${seatStatuses.length} estados de asientos`);
    
    // Si no hay registros de status, buscar en tickets para inicializar
    if (seatStatuses.length === 0) {
      console.log(`No hay registros de SeatStatus, buscando en tickets...`);
      const tickets = await Ticket.find({ screening: screeningId });
      console.log(`Encontrados ${tickets.length} tickets para la proyección`);
      
      // Crear registros de estado para asientos ocupados desde tickets
      if (tickets.length > 0) {
        // Extraer todos los asientos de todos los tickets
        const seatStatusDocs = [];
        
        tickets.forEach(ticket => {
          // Los tickets pueden tener múltiples asientos
          if (ticket.seats && Array.isArray(ticket.seats)) {
            ticket.seats.forEach(seat => {
              // Construir el ID del asiento en formato "A1", "B5", etc.
              const seatId = `${seat.row}${seat.number}`;
              
              seatStatusDocs.push({
                screeningId,
                seatId,
                status: 'occupied'
              });
            });
          }
        });
        
        console.log(`Creando ${seatStatusDocs.length} registros de SeatStatus`);
        
        if (seatStatusDocs.length > 0) {
          await SeatStatus.insertMany(seatStatusDocs);
          seatStatuses = await SeatStatus.find({ screeningId });
        }
      }
    }
    
    res.json(seatStatuses);
  } catch (error) {
    console.error('Error en GET /:screeningId:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;