const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  // Danh sách model đa dạng, từ bản mới nhất đến bản ổn định nhất
  const modelsToTry = [
    { name: "gemini-1.5-flash", version: "v1" },
    { name: "gemini-1.5-flash-002", version: "v1" },
    { name: "gemini-2.0-flash-exp", version: "v1beta" },
    { name: "gemini-1.5-flash-8b", version: "v1" },
    { name: "gemini-1.5-pro", version: "v1" },
    { name: "gemini-1.0-pro-vision-latest", version: "v1beta" }
  ];
  
  let lastError = null;

  for (const config of modelsToTry) {
    const { name: modelName, version: apiVersion } = config;
    let retries = 1;
    
    while (retries >= 0) {
      try {
        console.log(`[AI] Attempting ${modelName} (${apiVersion}) - Retries: ${retries}`);
        
        const model = genAI.getGenerativeModel(
          { model: modelName },
          { apiVersion }
        );

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
        const errMsg = error.message || "";

        // Nếu lỗi 429 (Hết hạn mức) hoặc 503 (Server bận), chờ 2s và thử lại bản thân model đó
        if ((errMsg.includes("429") || errMsg.includes("503")) && retries > 0) {
          console.warn(`[AI] ${modelName} busy. Retrying in 2s...`);
          await delay(2000);
          retries--;
          continue;
        }

        // Nếu lỗi vùng (400 - Location) hoặc lỗi không tìm thấy (404), nhảy sang model tiếp theo ngay
        console.warn(`[AI] ${modelName} failed: ${errMsg.substring(0, 100)}...`);
        break; 
      }
    }
  }

  throw new Error(`AI Analysis failed after trying all models. Last error: ${lastError.message}`);
};

module.exports = { analyzeFoodImage };
