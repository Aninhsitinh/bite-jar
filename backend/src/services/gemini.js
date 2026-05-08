const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  // Use models available in the environment, prioritising Lite/Latest versions
  const modelsToTry = [
    "gemini-2.5-flash-lite", 
    "gemini-2.5-flash", 
    "gemini-2.0-flash-lite", 
    "gemini-2.0-flash"
  ];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    let retries = 1;
    while (retries >= 0) {
      try {
        console.log(`Attempting analysis with ${modelName} (Retries left: ${retries})...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `Bạn là một chuyên gia đánh giá dinh dưỡng nghiêm khắc nhưng hài hước.
Hãy phân tích hình ảnh thức ăn được cung cấp và TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ theo đúng cấu trúc sau:
{
  "food_name": "Tên món ăn dự đoán",
  "calories_estimate": số_nguyên_calo,
  "category": "healthy / oily / sweet / balanced",
  "fat_level": số_nguyên_từ_1_đến_10,
  "short_feedback": "Một câu nhận xét ngắn dưới 20 chữ, vui vẻ hoặc châm biếm về độ lành mạnh của món này"
}
Tuyệt đối không giải thích, không dùng Markdown (\`\`\`json), chỉ xuất chuỗi JSON thô.`;

        const imagePart = {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        const cleanedText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedText);
      } catch (error) {
        lastError = error;
        
        // If 503 (High demand) or 429 (Rate limit), wait and retry once
        if ((error.message.includes("503") || error.message.includes("429")) && retries > 0) {
          console.warn(`Model ${modelName} busy/limited. Retrying in 2 seconds...`);
          await delay(2000);
          retries--;
          continue;
        }

        console.warn(`Model ${modelName} failed:`, error.message);
        break; // Try next model
      }
    }
  }

  throw lastError;
};

module.exports = { analyzeFoodImage };
