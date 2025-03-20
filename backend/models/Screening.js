const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
    movie: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    room: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater', 
        required: true
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // formato "HH:MM"
    endTime: { type: String },
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

// Método pre-save para establecer el formato basado en la sala
screeningSchema.pre('save', async function(next) {
    // Si no hay una sala asignada, continuar
    if (!this.room) return next();
    
    try {
        // Buscar información de la sala
        const Room = mongoose.model('Theater');
        const roomInfo = await Room.findById(this.room);
        
        if (roomInfo) {
            // Ajustar formato según características de la sala
            if (roomInfo.isIMAX) {
                this.format = 'IMAX';
            } else if (roomInfo.is3D) {
                this.format = '3D';
            } else {
                this.format = '2D';
            }
            
            // Ajustar precio VIP si la sala tiene sección VIP
            if (roomInfo.hasVIP && !this.priceVIP) {
                this.priceVIP = this.priceRegular * 1.5; // 50% más por VIP
            }
            
            // Establecer asientos disponibles iniciales basados en capacidad
            if (!this.availableSeats) {
                this.availableSeats = roomInfo.capacity;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Índices para búsquedas de funciones
screeningSchema.index({ date: 1, startTime: 1 });
screeningSchema.index({ movie: 1 });
screeningSchema.index({ status: 1 });
screeningSchema.index({ room: 1, date: 1 });

const Screening = mongoose.model('Screening', screeningSchema);

module.exports = Screening;