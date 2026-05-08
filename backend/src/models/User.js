const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cutoff_time: {
    type: DataTypes.TIME,
    defaultValue: '20:00:00'
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  jars_filled: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ai_personality: {
    type: DataTypes.ENUM('strict', 'friendly'),
    defaultValue: 'friendly'
  },
  notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
