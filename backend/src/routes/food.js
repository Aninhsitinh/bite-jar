const express = require('express');
const router = express.Router();
const multer = require('multer');
const { FoodItem, Jar, User } = require('../models');
const { analyzeFoodImage } = require('../services/gemini');
const auth = require('../middleware/auth');

router.use(auth);

// Helper to check if jar should be locked based on user cutoff time
const checkLockStatus = async (userId, jar) => {
  // If explicitly closed by system/user, stay closed
  if (jar.status === 'closed') return true;
  
  const user = await User.findByPk(userId);
  if (!user || !user.cutoff_time) return false;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // If this jar is for a past date, it should be closed
  if (jar.date < todayStr) {
    jar.status = 'closed';
    await jar.save();
    return true;
  }

  // For today's jar, check the cutoff time
  const [hours, minutes] = user.cutoff_time.split(':').map(Number);
  const cutoff = new Date();
  cutoff.setHours(hours, minutes, 0, 0);

  // It's only locked if we are currently PAST the cutoff time of TODAY
  if (now > cutoff) {
    jar.status = 'closed';
    await jar.save();
    return true;
  }

  return false;
};

// Fetch today's data with real-time lock check
router.get('/today', async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];
    
    let [jar] = await Jar.findOrCreate({
      where: { userId, date: today },
      defaults: { status: 'open', total_calories: 0, water_intake: 0 }
    });

    const isLocked = await checkLockStatus(userId, jar);
    const user = await User.findByPk(userId);

    // Comprehensive Streak & Jar Management
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 1. Count total jars filled (closed jars)
    const jarsFilled = await Jar.count({ where: { userId, status: 'closed' } });
    if (user.jars_filled !== jarsFilled) {
       user.jars_filled = jarsFilled;
       await user.save();
    }

    // 2. Advanced Streak Logic
    const lastActiveJar = await Jar.findOne({
      where: { userId, date: yesterdayStr }
    });

    // Reset streak if missed yesterday
    if (!lastActiveJar && user.streak > 0 && user.updatedAt < yesterday) {
       user.streak = 0;
       await user.save();
    }
    
    // Increment streak if active today and not already incremented
    // (We only increment streak if they added something yesterday and today)
    const todayItems = await FoodItem.count({ where: { jarId: jar.id } });
    if (todayItems > 0 && lastActiveJar && user.streak === 1 && user.updatedAt < now.setHours(0,0,0,0)) {
       // This is just a placeholder logic, streak management can get complex
    }

    const items = await FoodItem.findAll({
      where: { jarId: jar.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: jar.status,
      total_calories: jar.total_calories,
      water_intake: jar.water_intake,
      streak: user.streak,
      items
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Update water intake
router.post('/water', async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body; // e.g., 1 to add one glass
    const today = new Date().toISOString().split('T')[0];
    
    const jar = await Jar.findOne({ where: { userId, date: today } });
    if (!jar) return res.status(404).json({ error: 'Jar not found' });
    
    const isLocked = await checkLockStatus(userId, jar);
    if (isLocked) return res.status(403).json({ error: 'Jar is locked for today' });

    await jar.increment('water_intake', { by: amount || 1 });
    const updatedJar = await jar.reload();
    
    res.json({ water_intake: updatedJar.water_intake });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update water' });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const aiResult = await analyzeFoodImage(req.file.buffer, req.file.mimetype);
    const userId = req.userId; 
    const today = new Date().toISOString().split('T')[0];
    
    let [jar] = await Jar.findOrCreate({
      where: { userId, date: today },
      defaults: { status: 'open' }
    });

    const isLocked = await checkLockStatus(userId, jar);
    if (isLocked) return res.status(403).json({ error: 'Jar is locked for today!' });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const foodItem = await FoodItem.create({
      jarId: jar.id,
      image_data: `data:${req.file.mimetype};base64,${b64}`,
      food_name: aiResult.food_name,
      category: aiResult.category,
      fat_level: aiResult.fat_level,
      calories: Array.isArray(aiResult.calories_estimate) ? aiResult.calories_estimate[0] : aiResult.calories_estimate,
      ai_feedback: aiResult.short_feedback
    });

    await jar.increment('total_calories', { by: parseInt(foodItem.calories) || 0 });
    
    // Streak logic: If this is the first item of the day, potentially increment streak
    // (A more robust streak logic would be handled in a daily job or during fetchTodayData)

    res.json(foodItem);
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ error: 'Failed to process meal' });
  }
});

module.exports = router;
