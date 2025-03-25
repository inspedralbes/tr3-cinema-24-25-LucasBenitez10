const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    screening: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screening',
        required: true
    },
    customer: {
        name: { type: String },
        email: { type: String, required: true },
        phone: { type: String }
    },
    // Reemplazar seatNumber con un array de asientos
    seats: [{
        row: { type: String },
        number: { type: String },
        _id: false // Para evitar que cada asiento tenga su propio _id
    }],
    totalSeats: { type: Number, default: function() { return this.seats.length; } },
    ticketType: { 
        type: String,
        enum: ['regular', 'vip', 'student', 'senior'],
        default: 'regular'
    },
    price: { type: Number, required: true },
    paymentStatus: { 
        type: String,
        enum: ['pending', 'completed', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentMethod: { 
        type: String,
        enum: ['credit_card','cash']
    },
    ticketCode: { type: String, unique: true }
}, {
    timestamps: true
});

// Validación para asegurar que hay al menos un asiento
ticketSchema.path('seats').validate(function(seats) {
    return seats && seats.length > 0;
}, 'Al menos un asiento debe ser seleccionado');

ticketSchema.index({ screening: 1 });
ticketSchema.index({ 'customer.email': 1 });
// Índice para búsquedas rápidas por asientos
ticketSchema.index({ 'screening': 1, 'seats.row': 1, 'seats.number': 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;