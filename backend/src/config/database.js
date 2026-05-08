const pg = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not defined. Database operations will fail.');
}

// Debug log (Safe: hides password)
const maskedUrl = process.env.DATABASE_URL.replace(/:(\/\/.*):(.*)@/, ':$1:****@');
console.log('Connecting to database with URL:', maskedUrl);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

module.exports = sequelize;
