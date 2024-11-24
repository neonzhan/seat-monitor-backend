// models/SeatReclined.js

const mongoose = require('mongoose');

const SeatReclinedSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        enum: ['Reclined', 'Normal'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SeatReclined', SeatReclinedSchema);
