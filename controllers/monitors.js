const express = require('express');
const mongoose = require('mongoose');
const Monitor = require('../models/monitors')

exports.getMonitor = async (req, res) => {
    Monitor.findOne({_id: req.id}, (err, monitor) => {
        if (err) {
            res.status(400).send();
        }
        else {
            res.send(monitor);
        }
    });
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

exports.updateMonitor = (req, res) => {
    // TODO: Ensure user is monitor owner
    Monitor.updateOne({_id: req.body.id},{$set: req.body}, (err, monitor) => {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.status(200).send(monitor);
        }
    })
}

exports.deleteMonitor = (req, res) => {

}
