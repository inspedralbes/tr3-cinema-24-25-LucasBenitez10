const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // ID de TMDB
    name: { type: String, required: true }
}, {
    timestamps: true
});


const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;