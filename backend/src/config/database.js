const pg = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn('WARNING: DATABASE_URL is not defined. Database operations will fail.');
}

// Khởi tạo Sequelize chỉ khi có URL, nếu không sẽ dùng một đối tượng giả để tránh sập app
const sequelize = dbUrl 
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : { 
      define: () => ({}), 
      authenticate: () => Promise.reject('No Database URL'),
      prototype: {} 
    };

module.exports = sequelize;
