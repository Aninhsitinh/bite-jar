const express = require('express');
const router = express.Router();
const multer = require('multer');
const { FoodItem, Jar } = require('../models');
const { analyzeFoodImage } = require('../services/gemini');
const auth = require('../middleware/auth');

router.use(auth);

// Fetch today's data
router.get('/today', async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];
    
    let [jar] = await Jar.findOrCreate({
      where: { userId, date: today },
      defaults: { status: 'open' }
    });

    const items = await FoodItem.findAll({
      where: { jarId: jar.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: jar.status,
      total_calories: jar.total_calories,
      items
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // 1. Convert to Base64 for DB storage
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const imageData = `data:${req.file.mimetype};base64,${b64}`;

    // 2. Analyze with Gemini
    const aiResult = await analyzeFoodImage(req.file.buffer, req.file.mimetype);

    // 3. Find or create today's Jar for the user
    const userId = req.userId; 
    const today = new Date().toISOString().split('T')[0];
    
    let [jar] = await Jar.findOrCreate({
      where: { userId, date: today },
      defaults: { status: 'open' }
    });

    if (jar.status === 'closed') {
      return res.status(403).json({ error: 'Jar is closed for today!' });
    }

    // 4. Save FoodItem
    const foodItem = await FoodItem.create({
      jarId: jar.id,
      image_data: imageData,
      food_name: aiResult.food_name,
      category: aiResult.category,
      fat_level: aiResult.fat_level,
      calories: aiResult.calories_estimate,
      ai_feedback: aiResult.short_feedback
    });

    // 5. Update Jar total calories
    await jar.increment('total_calories', { by: aiResult.calories_estimate });

    res.json(foodItem);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process meal' });
  }
});

module.exports = router;
