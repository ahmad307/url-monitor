const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
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
        required: true
    }
})

module.exports = mongoose.model('Request', requestSchema);
