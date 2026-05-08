const axios = require('axios');
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  try {
    console.log(`[AI] Attempting analysis with gemini-1.5-flash...`);
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Bạn là một chuyên gia dinh dưỡng. Phân tích món ăn và trả về JSON: {\"food_name\": \"...\", \"calories_estimate\": 0, \"category\": \"balanced\", \"fat_level\": 5, \"short_feedback\": \"...\"}" },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBuffer.toString("base64")
            }
          }
        ]
      }]
    };

    const response = await axios.post(url, payload, { timeout: 30000 });
    
    if (response.data && response.data.candidates) {
      const text = response.data.candidates[0].content.parts[0].text;
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanedText);
    }
    
    throw new Error("No response from AI");

  } catch (error) {
    const status = error.response ? error.response.status : 'Error';
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[AI] Error (${status}): ${msg}`);
    throw new Error(`AI failed. Region block detected? Try Oregon. (${status})`);
  }
};

module.exports = { analyzeFoodImage };
