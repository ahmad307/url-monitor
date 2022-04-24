const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    httpStatus: {
        type: Number,
        required: true
    },
    urlState: {
        type: String,
        enum: {
            values: ['up', 'down']
        },
        required: true
    },
    result: {
        type: Object,
    }
})

module.exports = mongoose.model('Request', requestSchema);
