const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL is not defined in environment variables');
  process.exit(1);
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
