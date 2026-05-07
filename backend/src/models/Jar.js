const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jar = sequelize.define('Jar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open'
  },
  total_calories: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  daily_verdict: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date']
    }
  ]
});

module.exports = Jar;
