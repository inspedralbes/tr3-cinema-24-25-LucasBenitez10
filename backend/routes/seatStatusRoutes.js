const express = require('express');
const router = express.Router();
const SeatStatus = require('../models/SeatStatus'); 
const Ticket = require('../models/Ticket');

router.post('/mark-occupied', async (req, res) => {
  try {
    const { screeningId, seatIds } = req.body;
    
    
    
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
    
    
    
    const result = await SeatStatus.bulkWrite(bulkOps);
   
    
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
    
    
    
    // Buscar estados de asientos existentes
    let seatStatuses = await SeatStatus.find({ screeningId });
    
    
    // Si no hay registros de status o son pocos, sincronizar con los tickets activos
    if (seatStatuses.length === 0) {
      
      
      // Buscar todos los tickets ACTIVOS para esta proyección
      const activeTickets = await Ticket.find({ 
        screening: screeningId,
        status: 'active' // Solo considerar tickets activos
      });
      
      
      
      // Crear registros de estado para asientos ocupados desde tickets activos
      if (activeTickets.length > 0) {
        // Extraer todos los asientos de todos los tickets activos
        const seatStatusDocs = [];
        
        activeTickets.forEach(ticket => {
          // Los tickets pueden tener múltiples asientos
          if (ticket.seats) {
            // Construir el ID del asiento en formato "A1", "B5", etc.
            const seatId = `${ticket.seats.row}${ticket.seats.number}`;
            
            seatStatusDocs.push({
              screeningId,
              seatId,
              status: 'occupied',
              ticketId: ticket._id
            });
          }
        });
        
       
        
        if (seatStatusDocs.length > 0) {
          // Usar bulkWrite para hacer upserts de todos los asientos
          const bulkOps = seatStatusDocs.map(seatDoc => ({
            updateOne: {
              filter: { screeningId, seatId: seatDoc.seatId },
              update: { $set: seatDoc },
              upsert: true
            }
          }));
          
          await SeatStatus.bulkWrite(bulkOps);
          
          // Obtener los estados actualizados
          seatStatuses = await SeatStatus.find({ screeningId });
        }
      }
    } else {
      // MEJORA: Verificar si hay algún asiento ocupado que pertenezca a un ticket cancelado
      const seatIdsToCheck = seatStatuses
        .filter(seat => seat.status === 'occupied' && seat.ticketId)
        .map(seat => ({ 
          seatId: seat.seatId, 
          ticketId: seat.ticketId 
        }));
        
      if (seatIdsToCheck.length > 0) {
        
        
        // Obtener los IDs de tickets
        const ticketIds = seatIdsToCheck.map(item => item.ticketId);
        
        // Buscar tickets cancelados
        const cancelledTickets = await Ticket.find({
          _id: { $in: ticketIds },
          status: 'cancelled'
        });
        
        if (cancelledTickets.length > 0) {
         
          
          // Crear un conjunto de IDs de tickets cancelados para búsqueda rápida
          const cancelledTicketIds = new Set(cancelledTickets.map(t => t._id.toString()));
          
          // Filtrar los asientos que deben liberarse (los que pertenecen a tickets cancelados)
          const seatsToFree = seatIdsToCheck
            .filter(item => cancelledTicketIds.has(item.ticketId.toString()))
            .map(item => item.seatId);
          
          if (seatsToFree.length > 0) {
            
            
            // Actualizar estos asientos a "free"
            await SeatStatus.updateMany(
              { screeningId, seatId: { $in: seatsToFree } },
              { $set: { status: 'free', ticketId: null } }
            );
            
            // Actualizar la lista de estados de asientos
            seatStatuses = await SeatStatus.find({ screeningId });
          }
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