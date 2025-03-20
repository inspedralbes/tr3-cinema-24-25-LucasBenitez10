const mongoose = require('mongoose');


const dateSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: Number, required: true },
}, {
    timestamps: true
});

const DateModel = mongoose.model('Date', dateSchema);

module.exports = DateModel;