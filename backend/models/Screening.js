const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
    movie: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    room: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // formato "HH:MM"
    endTime: { type: String }, // se puede calcular automáticamente
    priceRegular: { type: Number, required: true },
    priceVIP: { type: Number },
    language: { 
        type: String,
        enum: ['original', 'dubbed', 'subtitled'],
        default: 'subtitled'
    },
    format: { 
        type: String,
        enum: ['2D', '3D', 'IMAX'],
        default: '2D'
    },
    availableSeats: { type: Number, required: true },
    status: { 
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

// Índices para búsquedas de funciones
screeningSchema.index({ date: 1, startTime: 1 });
screeningSchema.index({ movie: 1 });
screeningSchema.index({ status: 1 });

const Screening = mongoose.model('Screening', screeningSchema);

module.exports = Screening;