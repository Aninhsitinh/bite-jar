const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL is not defined in .env file');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    // Required for Render/Cloud SQL sometimes
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false
    // }
  }
});

module.exports = sequelize;
