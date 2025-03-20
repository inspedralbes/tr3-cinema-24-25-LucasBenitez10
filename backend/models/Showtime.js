const mongoose = require('mongoose');

const ShowtimeSchema = new mongoose.Schema({
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6, 
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} no es un entero válido para día de la semana'
        }
    },
    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Validar formato de hora HH:MM
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} no es un formato de hora válido (HH:MM)`
        }
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Campos adicionales que podrías necesitar
    // movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    // isFull: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados de horarios en la misma sala y día
ShowtimeSchema.index({ theaterId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

const Showtime = mongoose.model('Showtime', ShowtimeSchema);

module.exports = Showtime;