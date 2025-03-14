const Room = require('../models/Room');
const Screening = require('../models/Screening');

/**
 * Obtiene todas las salas
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de salas
 */
const getRooms = async (filters = {}) => {
  try {
    const query = { ...filters };
    
    const rooms = await Room.find(query).sort({ name: 1 });
    return rooms;
  } catch (error) {
    console.error('Error al obtener salas:', error);
    throw error;
  }
};

/**
 * Crea una nueva sala
 * @param {Object} roomData - Datos de la sala
 * @returns {Promise<Object>} Sala creada
 */
const createRoom = async (roomData) => {
  try {
    const { name, capacity, hasVIP, is3D, isIMAX } = roomData;
    
    // Verificar si ya existe una sala con el mismo nombre
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      throw new Error(`Ya existe una sala con el nombre "${name}"`);
    }
    
    // Crear la sala
    const newRoom = await Room.create({
      name,
      capacity,
      hasVIP: hasVIP || false,
      is3D: is3D || false,
      isIMAX: isIMAX || false,
      status: 'active'
    });
    
    return newRoom;
  } catch (error) {
    console.error('Error al crear sala:', error);
    throw error;
  }
};

/**
 * Actualiza una sala existente
 * @param {String} roomId - ID de la sala
 * @param {Object} roomData - Datos a actualizar
 * @returns {Promise<Object>} Sala actualizada
 */
const updateRoom = async (roomId, roomData) => {
  try {
    // Verificar si la sala existe
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Sala no encontrada');
    }
    
    // Si se cambia el nombre, verificar que no exista otra sala con ese nombre
    if (roomData.name && roomData.name !== room.name) {
      const existingRoom = await Room.findOne({ name: roomData.name });
      if (existingRoom) {
        throw new Error(`Ya existe una sala con el nombre "${roomData.name}"`);
      }
    }
    
    // Actualizar la sala
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      roomData,
      { new: true }
    );
    
    return updatedRoom;
  } catch (error) {
    console.error('Error al actualizar sala:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una sala
 * @param {String} roomId - ID de la sala
 * @param {String} status - Nuevo estado
 * @returns {Promise<Object>} Sala actualizada
 */
const updateRoomStatus = async (roomId, status) => {
  try {
    const validStatuses = ['active', 'maintenance', 'closed'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Estado no válido');
    }
    
    // Verificar funciones futuras si se cierra o pone en mantenimiento
    if (status === 'maintenance' || status === 'closed') {
      const futureScreenings = await Screening.find({
        room: roomId,
        date: { $gte: new Date() },
        status: 'scheduled'
      });
      
      if (futureScreenings.length > 0) {
        throw new Error('No se puede cambiar el estado porque hay funciones programadas para esta sala');
      }
    }
    
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true }
    );
    
    if (!updatedRoom) {
      throw new Error('Sala no encontrada');
    }
    
    return updatedRoom;
  } catch (error) {
    console.error('Error al actualizar estado de sala:', error);
    throw error;
  }
};

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  updateRoomStatus
};