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
    seatNumber: { type: String, required: true }, 
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
        enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'other']
    },
    ticketCode: { type: String, unique: true }
}, {
    timestamps: true
});

ticketSchema.index({ screening: 1 });
ticketSchema.index({ 'customer.email': 1 });


const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;