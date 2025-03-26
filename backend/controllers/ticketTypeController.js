const TicketType = require('../models/TicketType');

// Obtener todos los tipos de entradas activos
const getAllActiveTicketTypes = async (req, res) => {
    try {
        const ticketTypes = await TicketType.find({ isActive: true });
        res.json(ticketTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los tipos de entradas (para admin)
const getAllTicketTypes = async (req, res) => {
    try {
        const ticketTypes = await TicketType.find();
        res.json(ticketTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un tipo de entrada por ID
const getTicketTypeById = async (req, res) => {
    try {
        const ticketType = await TicketType.findById(req.params.id);
        if (!ticketType) {
            return res.status(404).json({ message: 'Tipo de entrada no encontrado' });
        }
        res.json(ticketType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo tipo de entrada
const createTicketType = async (req, res) => {
    try {
        const ticketType = new TicketType(req.body);
        const savedTicketType = await ticketType.save();
        res.status(201).json(savedTicketType);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar un tipo de entrada
const updateTicketType = async (req, res) => {
    try {
        const ticketType = await TicketType.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!ticketType) {
            return res.status(404).json({ message: 'Tipo de entrada no encontrado' });
        }
        
        res.json(ticketType);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Desactivar un tipo de entrada (sin eliminarlo)
const deactivateTicketType = async (req, res) => {
    try {
        const ticketType = await TicketType.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!ticketType) {
            return res.status(404).json({ message: 'Tipo de entrada no encontrado' });
        }
        
        res.json({ message: 'Tipo de entrada desactivado correctamente', ticketType });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener precios para una película específica
const getTicketTypesForMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const ticketTypes = await TicketType.find({ isActive: true });
        
        // Aplicar precios especiales si existen
        const result = ticketTypes.map(type => {
            const price = type.getPriceForMovie(movieId);
            return {
                _id: type._id,
                code: type.code,
                name: type.name,
                description: type.description,
                price: price,
                isActive: type.isActive
            };
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllActiveTicketTypes,
    getAllTicketTypes,
    getTicketTypeById,
    createTicketType,
    updateTicketType,
    deactivateTicketType,
    getTicketTypesForMovie
};