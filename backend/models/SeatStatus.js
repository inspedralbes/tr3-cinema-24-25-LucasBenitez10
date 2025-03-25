const mongoose = require('mongoose');

const seatStatusSchema = new mongoose.Schema({
  screeningId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screening',
    required: true
  },
  seatId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['free', 'occupied', 'reserved', 'maintenance'],
    default: 'free'
  },
  reservationExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Índice compuesto para búsquedas eficientes y unicidad
seatStatusSchema.index({ screeningId: 1, seatId: 1 }, { unique: true });

const SeatStatus = mongoose.model('SeatStatus', seatStatusSchema);

module.exports = SeatStatus;