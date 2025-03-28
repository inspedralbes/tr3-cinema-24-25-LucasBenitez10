
const Room = require('../models/Room')

const defaultRooms = [
  {
    name: 'Sala Estándar 1',
    capacity: 120,
    hasVIP: false,
    is2D: true,
    is3D: false,
    isIMAX: false,
    status: 'active'
  },
  {
    name: 'Sala Estándar 2',
    capacity: 150,
    hasVIP: false,
    is2D: true,
    is3D: false,
    isIMAX: false,
    status: 'active'
  },
  {
    name: 'Sala VIP',
    capacity: 80,
    hasVIP: true,
    is3D: false,
    isIMAX: false,
    status: 'active'
  },
  {
    name: 'Sala 3D',
    capacity: 100,
    hasVIP: false,
    is3D: true,
    isIMAX: false,
    status: 'active'
  },
  {
    name: 'Sala IMAX',
    capacity: 200,
    hasVIP: false,
    is3D: false,
    isIMAX: true,
    status: 'active'
  },
  {
    name: 'Sala Premium',
    capacity: 60,
    hasVIP: true,
    is3D: true,
    isIMAX: false,
    status: 'active'
  }
];

const seedRooms = async () => {
  try {
    // Verificar cuántas salas existen actualmente
    const count = await Room.countDocuments();
    
    if (count === 0) {
      // Si no hay salas, crear todas las predeterminadas de una vez
      await Room.insertMany(defaultRooms);
      
    } else {
      console.log(`Ya existen salas en la base de datos. No se crearon salas predeterminadas.`);
    }
    
    console.log('Proceso de seed de salas completado');
  } catch (error) {
    console.error('Error al crear salas predeterminadas:', error);
  }
};

module.exports = seedRooms;