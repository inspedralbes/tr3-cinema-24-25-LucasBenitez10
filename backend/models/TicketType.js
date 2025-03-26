const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        // Quitamos unique: true de aquí para evitar la definición duplicada
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Relación con precios especiales por película (opcional)
    specialPricing: [{
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        },
        price: {
            type: Number,
            min: 0
        }
    }]
}, { 
    timestamps: true 
});

// Método para verificar si hay un precio especial para una película
ticketTypeSchema.methods.getPriceForMovie = function(movieId) {
    if (!movieId) return this.price;
    
    const specialPrice = this.specialPricing.find(
        p => p.movie.toString() === movieId.toString()
    );
    
    return specialPrice ? specialPrice.price : this.price;
};

// Índices para mejorar el rendimiento de las búsquedas
// Definimos todos los índices explícitamente aquí
ticketTypeSchema.index({ code: 1 }, { unique: true }); // Mantenemos este único índice
ticketTypeSchema.index({ isActive: 1 });
ticketTypeSchema.index({ 'specialPricing.movie': 1 });

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = TicketType;