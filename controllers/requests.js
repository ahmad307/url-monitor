const cron = require('node-cron');
const axios = require('axios');
const http = require('http');
const https = require('https');
const nodemailer = require('nodemailer');
const Monitor = require('../models/monitors');
const User = require('../models/users');

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
    const request = await sendRequest(monitor);

    // Alert user if failure threshold met or url goes up
    if (request.urlState === 'up' && monitor.state === 'down') {
        await notify(monitor.owner, `Your url of monitor id ${monitor._id} is up again!`);
    }
    else if (monitor.outages === monitor.alertsThreshold) {
        await notify(monitor.owner, `Your url of monitor id ${monitor._id} is down!`);
    }

    // Update outages, backlog, state, avg reponse time
    if (request.urlState === 'up') {
        monitor.state = 'up';
    }
    else {
        monitor.state = 'down';
        monitor.outages = monitor.outages + 1;
    }
    if (request.responseTime) {
        monitor.averageResponseTime = (monitor.averageResponseTime + request.responseTime) / 2;
    }
    monitor.backlog.push(request);
    monitor.save();

    // Schedule next request
    const reqTime = new Date(Date.now() + Number(monitor.requestInterval) * 1000);
    cron.schedule(dateToCron(reqTime), () => {
        this.handleRequest(monitor._id);
    })
}

async function sendRequest(monitor) {
    let success, status, responseTime;
    try {
        // Set interceptor to measure request time
        axios.interceptors.request.use((config) => {
            config.headers['request-startTime'] = new Date().getTime();
            return config
        })
        axios.interceptors.response.use((response) => {
            const currentTime = new Date().getTime()      
            const startTime = response.config.headers['request-startTime']      
            response.headers['request-duration'] = currentTime - startTime      
            return response
        })

        // Set request config and headers
        const config = {
            timeout: monitor.timeout * 1000,  // Convert timeout to milliseonds
            headers: monitor.headers,
            auth: monitor.authHeader
        }
        if (monitor.ignoreSSL === true) {
            if (monitor.port === 'http') {
                config.httpAgent = new http.Agent({rejectUnauthorized: false});
            }
            else if (monitor.port === 'https') {
                config.httpsAgent = new https.Agent({rejectUnauthorized: false});
            }
        }
        const response = await axios.get(monitor.url, {}, config);

        // Handle successful requests
        success = true;
        status = response.status;
        responseTime = response.headers['request-duration'] / 1000;
    }
    catch (err) {
        err = err.toJSON();
        success = false;
        
        // Handle url not found
        if (err.status === null) {
            status = 404;
        }
        // Handle successful request but url down
        else {
            status = err.status;
        }
    }

    const request = {status: status};
    if (responseTime) {
        request.responseTime = responseTime;
    }

    if (monitor.assertionStatus === status || (monitor.assertionStatus === undefined && success)) {
        request.urlState = 'up';
    }
    else {
        request.urlState = 'down';
    }
    
    console.log(`Request completed in ${responseTime} time.`)
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

async function notify(userId, message) {
    const user = await User.findOne({_id: userId});
    sendEmail(user.email, message);
}

function sendEmail(email, body) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
    });
    
    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Url Monitor Alert',
        text: body
    };
    
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }); 
}
