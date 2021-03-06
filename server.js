if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}    

const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const monitorsRouter = require('./routes/monitors');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const MongoStore = require('connect-mongo');
const userModel = require('./models/users');
const userController = require('./controllers/users');
const port = 3000;
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

// Set MongoDb connection
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection
db.on('error', error => console.log(error));
db.once('open', () => console.log('Connected to MongoDb'));

// Passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.DB_URL}),
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: 'email'}, userController.authenticate));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    userModel.findById(id, (err, user) => {
        done(err, user);
    });
});

// Routes
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Welcome ${req.user.name}`);
    }
    else {
        res.send('Welcome to Url Monitor');
    }
});
app.use('/users', usersRouter);
app.use('/monitors', userController.isLoggedIn, monitorsRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});