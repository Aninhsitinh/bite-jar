const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  // Khởi tạo SDK. Mặc định nó sẽ dùng phiên bản tốt nhất.
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Danh sách Model "bủa lưới" - Thử tất cả các tên có thể có
  const MODELS_TO_TRY = [
    "gemini-1.5-flash-latest", // Tên đầy đủ bản Flash 1.5
    "gemini-1.5-flash",        // Tên ngắn bản Flash 1.5
    "gemini-2.0-flash-exp",    // Bản 2.0 Flash mới nhất
    "gemini-1.5-pro-latest",   // Thử cả bản Pro nếu có quyền
    "gemini-1.5-flash-8b"      // Bản siêu nhẹ
  ];

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[AI] >>> Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

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
      
      const cleanedText = text.replace(/```json|```/g, "").trim();
      console.log(`[AI] !!! SUCCESS with ${modelName}`);
      
      return JSON.parse(cleanedText);

    } catch (error) {
      // Ghi log chi tiết để debug nhưng vẫn tiếp tục thử model khác
      console.warn(`[AI] Model ${modelName} failed with: ${error.message}`);
      lastError = error;
      
      // Nếu là lỗi 429 (hết lượt), vẫn thử model khác vì mỗi model có quota riêng
      continue; 
    }
  }

  // Nếu tất cả đều thất bại
  console.error(`[AI] FATAL: All attempts exhausted.`);
  throw new Error(`AI Failure. Last error: ${lastError.message}`);
};

module.exports = { analyzeFoodImage };
