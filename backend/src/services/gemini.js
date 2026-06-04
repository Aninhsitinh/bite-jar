const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log(`[AI] Initializing model...`);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = "Bạn là một chuyên gia dinh dưỡng. Phân tích ảnh món ăn và trả về JSON: {\"food_name\": \"...\", \"calories_estimate\": 0, \"category\": \"balanced\", \"fat_level\": 5, \"short_feedback\": \"...\"}. Ngôn ngữ: Tiếng Việt.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json|```/g, "").trim();
    console.log(`[AI] SUCCESS with gemini-flash-latest`);

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error(`[AI] Fatal Error:`, error);
    throw error;
  }
};

module.exports = { analyzeFoodImage };
