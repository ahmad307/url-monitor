const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../models/users')

exports.addUser = (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    user.save((err, newUser) => {
        if (err){
            res.status(400).send(err);
        }
        else {
            passport.authenticate("local");
            res.status(200).send(`User ${newUser.name} added`);
        }
    })
}

exports.updateUser = async (req, res) => {
    const body = req.body;
    const user = await User.findOne({email: body.email});
    if (!user) {
        return res.status(400).send('User not found');
    }

    if (body.name) {
        user.name = body.name;
    }
    if (body.password) {
        user.password = body.password;
    }

    user.save((err) => {
        if (err) {
            res.status(409).send(err);
        }
        else {
            res.status(200).send();
        }
    })
}

exports.deleteUser = (req, res) => {

}

exports.signIn = (req, res) => {
    passport.authenticate("local", {}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).send("User not found or incorrect password");
        }
        req.login(user, (err) => {
            if (err) throw(err);
        });
        res.status(200).send();
    })(req, res);
}

exports.authenticate = (email, password, done) => {
    // TODO: handle non-existing user
    User.findOne({email: email},'password', async(err, user) => {
        if (err)  {
            console.log('auth err');
            return done(err, false);
        }
        const isMatch = await user.comparePassword(password);
        if (isMatch)  {
            done(null, user);
        }
        else {
            done(null, false);
        }
    })
}

exports.signOut = (req, res) => {
    
}
