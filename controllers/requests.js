const cron = require('node-cron');
const axios = require('axios');
const Monitor = require('../models/monitors');
const Request = require('../models/requests');

exports.callMakeRequest = async (req, res) => {
    await this.handleRequest(req.query.id);
    res.send();
}

exports.handleRequest = async (id) => {
    const monitor = await Monitor.findOne({_id: id});

    // Update monitor's uptime/downtime based on last state (if exists)
    if (monitor.state === 'up') {
        monitor.upTime = monitor.upTime + monitor.requestInterval;
    }
    else if (monitor.state === 'down') {
        monitor.downTime = monitor.downTime + monitor.requestInterval;
    }

    // Make new request
    const request = await this.makeRequest(monitor);

    // Update outages, backlog, state
    if (request.urlState == 'up') {
        monitor.state = 'up';
    }
    else {
        monitor.state = 'down';
        monitor.outages = monitor.outages + 1;
    }
    monitor.backlog.push(request._id);
    monitor.save();

    // Schedule next request
    const reqTime = new Date(Date.now() + Number(monitor.requestInterval) * 1000);
    cron.schedule(dateToCron(reqTime), () => {
        this.handleRequest(monitor._id);
    })

    // Alert user if threshold exceeded
}

exports.makeRequest = async (monitor) => {
    const request = new Request();
    try {
        const config = {
            timeout: monitor.timeout * 1000  // Convert timeout to milliseonds
        }
        const response = await axios.get(monitor.url, {}, config);
        
        // Handle successful requests
        request.httpStatus = response.status;
        request.urlState = 'up';
        request.response = response;
    }
    catch (err) {
        err = err.toJSON();
        // Handle url not found
        if (err.status === null) {
            request.httpStatus = 404;
            request.urlState = 'down';
        }
        // Handle successful request but url down
        else {
            request.httpStatus = err.status;
            request.urlState = 'down';
            request.response = err;
        }
    }

    request.save();
    return request;
}

function dateToCron(date) {
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    const year = date.getYear();

    return `${seconds} ${minutes} ${hours} ${days} ${months} ${dayOfWeek} ${year}`;
};
