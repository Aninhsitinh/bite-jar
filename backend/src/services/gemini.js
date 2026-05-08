const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables!");
  }

  // In ra 4 ký tự đầu để bạn tự kiểm tra trên Render xem có đúng Key không
  console.log(`[AI-Debug] Using API Key starting with: ${apiKey.substring(0, 4)}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Chỉ thử 2 model mạnh nhất và phổ biến nhất
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Attempting ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Bạn là một chuyên gia dinh dưỡng. Phân tích món ăn và trả về JSON: {"food_name": "...", "calories_estimate": 0, "category": "balanced", "fat_level": 5, "short_feedback": "..."}`;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      lastError = error;
      console.warn(`[AI] ${modelName} failed: ${error.message}`);
      // Nếu lỗi là 404 hoặc 400, thử model tiếp theo ngay
    }
  }

  throw lastError;
};

module.exports = { analyzeFoodImage };
