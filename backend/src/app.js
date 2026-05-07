const express = require('express');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'BiteJar API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));
// app.use('/api/auth', require('./routes/auth'));

module.exports = app;
