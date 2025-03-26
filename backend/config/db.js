const mongoose = require('mongoose');
const seedRooms = require('../seeders/roomSeeder');
const seedTicketTypes = require('../seeders/ticketTypeSeeder');


const uri = 'mongodb+srv://benitezsojo:sdzpiuaOmyRUyeCT@cluster0.zoqvi.mongodb.net/cinemabar?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(uri); 

        console.log("Conexión exitosa a MongoDB usando Mongoose");

        // Ejecutar los seeders
        seedRooms();
        seedTicketTypes(); // Nuevo seeder para tipos de tickets
        
        // Ejecutar sincronización de películas (solo una vez al iniciar)
        try {
            console.log('Iniciando sincronización inicial de películas...');

            // Importar el controlador de películas
            const movieController = require('../controllers/movieController');

            // Ejecutar sincronización (solo 2 páginas para que sea rápido)
            const result = await movieController.syncMovies(2);
            console.log('Sincronización inicial completada:', result);
        } catch (syncError) {
            console.error('Error en sincronización inicial:', syncError);
            // No lanzamos el error para que la aplicación continúe funcionando
        }

    } catch (err) {
        console.error("Error al conectar a MongoDB:", err);
        throw err; // Re-lanzamos el error para que la aplicación pueda manejarlo
    }
};

module.exports = connectDB;