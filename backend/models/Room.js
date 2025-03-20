const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    hasVIP: { type: Boolean, default: false },
    is2d: { type: Boolean, default: false },
    is3D: { type: Boolean, default: false },
    isIMAX: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['active', 'maintenance', 'closed'], 
        default: 'active' 
    }
}, {
    timestamps: true
});

const Room = mongoose.model('Theater', RoomSchema);

module.exports = Room;