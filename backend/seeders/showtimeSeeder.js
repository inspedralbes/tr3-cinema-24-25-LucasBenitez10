
const Room = require('../models/Room'); // Ajusta la ruta si es necesario
const Showtime = require('../models/Showtime'); // Ajusta la ruta si es necesario

// Horarios predeterminados
const DEFAULT_TIMES = ['16:00', '18:00', '20:00'];

// Días de la semana (0 = Domingo, 1 = Lunes, ... 6 = Sábado)
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const seedShowtimes = async () => {
  try {
    // Verificar si ya existen horarios
    const count = await Showtime.countDocuments();
    
    if (count > 0) {
      console.log('Ya existen horarios en la base de datos. No se crearon horarios predeterminados.');
      return;
    }
    
    // Obtener todas las salas de cine
    const theaters = await Room.find({});
    
    if (theaters.length === 0) {
      console.log('No se encontraron salas para asignar horarios. Ejecute primero el seeder de salas.');
      return;
    }
    
    console.log(`Creando horarios para ${theaters.length} salas...`);
    
    // Crear array para inserción masiva
    let showtimesToInsert = [];
    
    // Para cada sala, crear horarios para todos los días
    theaters.forEach(theater => {
      ALL_DAYS.forEach(day => {
        DEFAULT_TIMES.forEach(time => {
          showtimesToInsert.push({
            theaterId: theater._id,
            dayOfWeek: day,
            startTime: time,
            isAvailable: true
          });
        });
      });
    });
    
    // Insertar todos los horarios de una vez
    await Showtime.insertMany(showtimesToInsert);
    
    console.log(`Se crearon ${showtimesToInsert.length} horarios predeterminados`);
    console.log('Proceso de seed de horarios completado');
  } catch (error) {
    console.error('Error al crear horarios predeterminados:', error);
  }
};

module.exports = seedShowtimes;