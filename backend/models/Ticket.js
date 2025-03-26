const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketCode: {
        type: String,
        required: true
        // Eliminamos unique: true de aquí para evitar la definición duplicada
    },
    screening: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screening',
        required: true
    },
    // Referencia al tipo de entrada
    ticketType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketType',
        required: true
    },
    // Almacenar también el código (más fácil para reportes)
    ticketTypeCode: {
        type: String,
        required: true
    },
    seats: {
        row: String,
        number: String
    },
    customerInfo: {
        name: String,
        email: String,
        phone: String
    },
    // Usuario relacionado (opcional)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Guardar el precio pagado en el momento de la compra
    pricePaid: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'used', 'cancelled', 'expired'],
        default: 'active'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'cash', 'paypal', 'other'],
        default: 'credit_card'
    },
    usedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Pre-save hook para generar código de ticket si no existe
ticketSchema.pre('save', async function(next) {
    if (!this.ticketCode) {
        // Generar un código único alfanumérico
        const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
        const datePart = Date.now().toString(36).substring(4).toUpperCase();
        this.ticketCode = `TK-${randomPart}-${datePart}`;
    }
    next();
});

// Definimos todos los índices usando schema.index()
ticketSchema.index({ ticketCode: 1 }, { unique: true }); // Mantener este para unicidad
ticketSchema.index({ screening: 1 });
ticketSchema.index({ ticketType: 1 });
ticketSchema.index({ 'customerInfo.email': 1 });
ticketSchema.index({ user: 1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;