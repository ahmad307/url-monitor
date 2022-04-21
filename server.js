if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}    

const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
const port = 3000;

mongoose.connect(process.env.DB_URL);
const db = mongoose.connection
db.on('error', error => console.log(error));
db.once('open', () => console.log('Connected to MongoDb'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send("Welcome to Url Monitor");
});

app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});