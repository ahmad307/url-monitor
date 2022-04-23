const express = require('express');
const mongoose = require('mongoose');
const Monitor = require('../models/monitors')

exports.getMonitor = async (req, res) => {
    const isUserOwner = await isOwner(req);
    if (isUserOwner === false) {
        return res.status(401).send();
    }
    
    try {
        const monitor = await Monitor.findOne({_id: req.params.id});
        res.send(monitor);
    } 
    catch (err) {
        res.status(400).send();
    }
}

exports.addMonitor = (req, res) => {
    const monitor = new Monitor({...req.body, owner: req.user.id});
    monitor.save((err, newMonitor) => {
        if (err) {
            return res.status(400).send(err);
        }
        else {
            return res.status(200).send(newMonitor);
        }
    })
}

exports.updateMonitor = async (req, res) => {
    const isUserOwner = await isOwner(req);
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
    const isUserOwner = await isOwner(req);
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

async function isOwner(req) {
    return new Promise(resolve => {
        Monitor.findOne({_id: req.params.id}, (err, monitor) => {
            if (err) {
                resolve(true);
            }
            else if (monitor.owner.toString() === req.user.id) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        })
    })
}
