const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FoodItem = sequelize.define('FoodItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jarId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_data: {
    type: DataTypes.TEXT, // Storing base64 here
    allowNull: false
  },
  food_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('healthy', 'oily', 'sweet', 'balanced'),
    allowNull: true
  },
  fat_level: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    }
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ai_feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = FoodItem;
