const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  try {
    console.log(`[AI] Initializing Google SDK with gemini-2.0-flash...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "Bạn là một chuyên gia dinh dưỡng. Hãy phân tích ảnh món ăn này. Trả về DUY NHẤT một chuỗi JSON thuần túy với cấu trúc: {\"food_name\": \"...\", \"calories_estimate\": 0, \"category\": \"balanced\", \"fat_level\": 5, \"short_feedback\": \"...\"}. Ngôn ngữ: Tiếng Việt.";

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
    
    // Làm sạch JSON nếu AI có lỡ tay thêm markdown
    const cleanedText = text.replace(/```json|```/g, "").trim();
    console.log(`[AI] SDK Success: ${cleanedText.substring(0, 50)}...`);
    
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error(`[AI] SDK Error:`, error.message);
    if (error.stack) console.error(error.stack);
    
    throw new Error(`AI SDK failed: ${error.message}. Check Vercel logs for full stack trace.`);
  }
};

module.exports = { analyzeFoodImage };
