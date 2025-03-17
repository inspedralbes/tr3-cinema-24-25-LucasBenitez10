const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: { type: Number, required: true, unique: true },
    adult: { type: Boolean, default: false },
    backdrop_path: { type: String },
    genre_ids: { type: [Number] },
    media_type: { type: String, enum: ['movie', 'tv', 'person'] },
    original_language: { type: String },
    original_title: { type: String },
    overview: { type: String },
    popularity: { type: Number, default: 0 },
    poster_path: { type: String },
    release_date: { type: Date },
    title: { type: String, required: true },
    video: { type: Boolean, default: false },
    vote_average: { type: Number, min: 0, max: 10, default: 0 },
    vote_count: { type: Number, default: 0 },
    duration: { type: Number, default: 120 }, 
    active: { type: Boolean, default: true } ,
    trailer: { key: String, name: String, official: Boolean, site: String, youtubeUrl: String }
}, {
    timestamps: true
});

// Solo mantener el índice de texto, eliminar el índice tmdbId
movieSchema.index({ title: 'text', original_title: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;