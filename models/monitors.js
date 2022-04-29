const mongoose = require('mongoose');

const authSchema = mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
})

const requestSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    status: {
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
    responseTime: {
        type: Number
    }
})

const monitorSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner can not be blank']
    },
    name: {
        type: String,
        required: [true, 'Name can not be blank']
    },
    url: {
        type: String,
        required: [true, 'Url can not be blank'],
    },
    protocol: {
        type: String,
        required: [true, 'Protocol can not be blank'],
        enum :{
            values: ['http', 'https', 'tcp'],
            message: 'Unsupported protocol'
        }
    },
    backlog: [requestSchema],
    // Optional
    upTime: {
        // Saved in seconds
        type: Number,
        default: 0
    },
    downTime: {
        // Saved in seconds
        type: Number,
        default: 0
    },
    averageResponseTime: {
        type: Number,
        default: 0
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    requestInterval: {
        // Saved in seconds
        type: Number,
        default: 600
    },
    requestTimeout: {
        // Saved in seconds
        type: Number,
        default: 5
    },
    outages: {
        type: Number,
        default: 0
    },
    state: {
        type: String,
        enum: {values: ['up', 'down']},
    },
    // Other
    path: {
        type: String,
    },
    port: {
        type: Number
    },
    webhook: {
        type: String,
    },
    alertsThreshold: {
        type: Number,
        default: 1
    },
    tag: {
        type: String,
    },
    authHeader: {
        type: authSchema
    },
    headers: {
        type: Object
    },
    assertionStatus: {
        type: Number
    },
    ignoreSSL: {
        type: Boolean
    }
})

monitorSchema.path('url').validate((val) => {
    urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    return urlRegex.test(val);
}, 'Invalid Url');

monitorSchema.path('webhook').validate((val) => {
    urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    return urlRegex.test(val);
}, 'Invalid Url');

monitorSchema.path('path').validate((val) => {
    return val[0] === '/';
}, 'Path must start with /');

module.exports = mongoose.model('Monitor', monitorSchema);
