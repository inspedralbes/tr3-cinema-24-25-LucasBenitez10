const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' }, // Nuevo campo para el teléfono
    role: {type: String, enum: ['admin', 'customer'], default: 'customer'}
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;