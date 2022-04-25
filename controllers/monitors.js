const Monitor = require('../models/monitors')
const requestsController = require('../controllers/requests');

exports.getMonitor = async (req, res) => {
    const isUserOwner = await isOwner(req.user, req.params.id);
    if (isUserOwner === false) {
        return res.status(401).send();
    }
    
    try {
        const monitor = await Monitor.findOne({_id: req.params.id});
        res.send(monitor);
    } 
    catch (err) {
        res.status(400).send(err);
    }
}

exports.addMonitor = (req, res) => {
    const monitor = new Monitor({...req.body, owner: req.user.id});
    monitor.save((err, newMonitor) => {
        if (err) {
            return res.status(400).send(err);
        }
        else {
            // Make first monitor request
            requestsController.handleRequest(monitor._id);
            return res.status(201).send(newMonitor);
        }
    })
}

exports.updateMonitor = async (req, res) => {
    const isUserOwner = await isOwner(req.user, req.params.id);
    if (isUserOwner === false) {
        return res.status(401).send();
    }
    Monitor.updateOne({_id: req.params.id},{$set: req.body}, (err, monitor) => {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.status(200).send(monitor);
        }
    })
}

exports.deleteMonitor = async (req, res) => {
    const isUserOwner = await isOwner(req.user, req.params.id);
    if (isUserOwner === false) {
        return res.status(401).send();
    }
    Monitor.deleteOne({_id: req.params.id}, (err) => {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.status(204).send();
        }
    })
}

exports.getReport = async (req, res) => {
    // Handle getting monitor reports by tag
    if (req.query.tag) {
        let monitors;
        try {
            monitors = await Monitor.find({tag: req.query.tag});
            let reports = [];
            monitors.forEach((monitor) => {
                reports.push(createReport(monitor));
            })

            res.status(200).send(reports);
        }
        catch (err) {
            res.status(400).send(err);
        }
    }
    // Handle getting report for certain monitor
    else {
        const isUserOwner = await isOwner(req.user, req.query.id);
        if (isUserOwner === false) {
            return res.status(401).send();
        }

        let monitor;
        try {
            monitor = await Monitor.findOne({_id: req.query.id});
        }
        catch (err) {
            return res.status(400).send(err);
        }
    
        const report = createReport(monitor);
        res.status(200).send(report);
    }
}

function createReport(monitor) {
    const report = {
        status: monitor.status,
        availability: (monitor.upTime / (monitor.upTime + monitor.downTime)) * 100,
        outages: monitor.outages,
        downtime: monitor.downTime,
        uptime: monitor.upTime,
        responseTime: monitor.averageResponseTime,
        history: monitor.backlog
    }

    return report;
}

async function isOwner(user, monitorId) {
    return new Promise(resolve => {
        Monitor.findOne({_id: monitorId}, (err, monitor) => {
            if (err) {
                resolve(true);
            }
            else if (monitor.owner.toString() === user.id) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        })
    })
}
