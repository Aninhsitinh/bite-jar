const express = require('express');
const router = express.Router();
const { User, Jar } = require('../models');
const auth = require('../middleware/auth');
const { Sequelize } = require('sequelize');

router.use(auth);

// Get profile data
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    // Get last 7 days of jars for the chart
    const last7DaysJars = await Jar.findAll({
      where: { 
        userId: req.userId 
      },
      order: [['date', 'DESC']],
      limit: 7
    });

    res.json({
      user,
      recent_jars: last7DaysJars.reverse()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile preferences
router.put('/profile', async (req, res) => {
  try {
    const { cutoff_time, ai_personality, notifications, username } = req.body;
    const user = await User.findByPk(req.userId);
    
    await user.update({
      cutoff_time: cutoff_time || user.cutoff_time,
      ai_personality: ai_personality || user.ai_personality,
      notifications: notifications !== undefined ? notifications : user.notifications,
      username: username || user.username
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
