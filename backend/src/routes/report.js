const express = require('express');
const router = express.Router();
const { User, Jar, FoodItem } = require('../models');
const auth = require('../middleware/auth');

router.use(auth);

// Get report for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const jar = await Jar.findOne({
      where: { 
        userId: req.userId,
        date: date
      },
      include: [{ model: FoodItem, as: 'items' }]
    });

    if (!jar) {
      return res.status(404).json({ error: 'No data found for this date' });
    }

    // Check if it's today and if it should be locked
    const today = new Date().toISOString().split('T')[0];
    if (date === today && jar.status === 'open') {
       const user = await User.findByPk(req.userId);
       const now = new Date();
       if (user.cutoff_time) {
          const [h, m, s] = user.cutoff_time.split(':').map(Number);
          const cutoff = new Date();
          cutoff.setHours(h, m, s || 0, 0);
          if (now > cutoff) {
             jar.status = 'closed';
             await jar.save();
          }
       }
    }

    // Calculate summary
    const totalItems = jar.items.length;
    const healthyCount = jar.items.filter(i => i.category === 'healthy').length;
    const oilyCount = jar.items.filter(i => i.category === 'oily').length;
    const sweetCount = jar.items.filter(i => i.category === 'sweet').length;

    let verdict = "Keep it up!";
    let statusColor = "bg-emerald-100 text-emerald-800";
    
    if (healthyCount > oilyCount + sweetCount) {
      verdict = "The Healthy Hero! You kept it mostly green today. Keep up the good momentum!";
      statusColor = "bg-emerald-100 text-emerald-800";
    } else if (oilyCount > healthyCount) {
      verdict = "A Bit Heavy Today. Your jar looks a bit oily. Try some greens tomorrow!";
      statusColor = "bg-orange-100 text-orange-800";
    }

    res.json({
      jar,
      summary: {
        totalItems,
        healthyPercent: totalItems > 0 ? Math.round((healthyCount / totalItems) * 100) : 0,
        oilyPercent: totalItems > 0 ? Math.round((oilyCount / totalItems) * 100) : 0,
        sweetPercent: totalItems > 0 ? Math.round((sweetCount / totalItems) * 100) : 0,
        verdict,
        statusColor
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

module.exports = router;
