const TicketType = require('../models/TicketType');

const seedTicketTypes = async () => {
    try {
        // Verificar si ya existen tipos de entradas
        const existingCount = await TicketType.countDocuments();
        
        if (existingCount > 0) {
            console.log(`Ya existen ${existingCount} tipos de entradas. Saltando seed.`);
            return;
        }
        
        // Datos iniciales
        const ticketTypes = [
            {
                code: 'normal',
                name: 'Normal',
                description: 'Entrada general',
                price: 10.40,
                isActive: true
            },
            {
                code: 'menor',
                name: 'Menores 13',
                description: 'Presentar DNI o Libro de familia. 1 entrada máx. por carnet. Debe tener entre 3 y 12 años.',
                price: 8.40,
                isActive: true
            },
            {
                code: 'joven',
                name: 'Carnet Joven',
                description: 'Titular del Carnet Joven Oficial -30, carnet estudiante universitario o carnet estudiante internacional (ISIC). 1 entrada máx. por carnet.',
                price: 8.40,
                isActive: true
            },
            {
                code: 'mayor',
                name: 'Mayores 65',
                description: 'Presentar DNI o documento acreditativo de edad. 1 entrada máx. por carnet.',
                price: 8.40,
                isActive: true
            },
            {
                code: 'familia',
                name: 'Familia Numerosa',
                description: 'Titular Carnet Familia Numerosa',
                price: 8.40,
                isActive: true
            }
        ];
        
        // Insertar los tipos de entradas
        await TicketType.insertMany(ticketTypes);
        console.log(`${ticketTypes.length} tipos de entradas inicializados correctamente`);
        
    } catch (error) {
        console.error('Error al sembrar tipos de entradas:', error);
    }
};

module.exports = seedTicketTypes;