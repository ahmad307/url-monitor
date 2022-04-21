const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/users')

exports.addUser = (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    user.save((err, newUser) => {
        if (err)
            res.status(400).send(err);
        else
            res.status(200).send(`User ${newUser.name} added`);
    })
}

exports.updateUser = (req, res) => {

}

exports.deleteUser = (req, res) => {

}

exports.signIn = (req, res) => {
    const {email, password} = req.body;
    User.findOne({email: email},'password', async(err, user) => {
        console.log("3");
        if (err)  res.status(400).send(err);
        const isMatch = await user.comparePassword(password);
        if (isMatch)  {
            res.status(200).send();
        }
        else {
            res.status(400).send("Incorrect password");
        }
    })
}

exports.signOut = (req, res) => {
    
}
