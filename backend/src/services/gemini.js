const axios = require('axios');
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing!");
  }

  // Danh sách các Model và Endpoint thử nghiệm
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-8b"];
  
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`[AI-Native] Attempting ${modelName} via Direct API...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [
            { text: "Bạn là một chuyên gia dinh dưỡng. Hãy phân tích hình ảnh và trả về JSON: {\"food_name\": \"...\", \"calories_estimate\": 0, \"category\": \"balanced\", \"fat_level\": 5, \"short_feedback\": \"...\"}" },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBuffer.toString("base64")
              }
            }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.candidates && response.data.candidates[0].content) {
        const text = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(text);
      }
      
    } catch (error) {
      lastError = error;
      const status = error.response ? error.response.status : 'No Status';
      const data = error.response ? JSON.stringify(error.response.data) : error.message;
      console.warn(`[AI-Native] ${modelName} failed (${status}): ${data.substring(0, 200)}`);
    }
  }

  throw new Error(`All AI Models failed. Last error: ${lastError.message}`);
};

module.exports = { analyzeFoodImage };
