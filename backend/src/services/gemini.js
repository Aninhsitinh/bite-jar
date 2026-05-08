const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Danh sách các model để thử nghiệm theo thứ tự ưu tiên
  const MODELS_TO_TRY = [
    "gemini-1.5-flash",      // Lựa chọn số 1: Ổn định nhất
    "gemini-1.5-flash-8b",   // Lựa chọn số 2: Nhẹ nhàng, dễ còn lượt dùng
    "gemini-2.0-flash-exp"   // Lựa chọn số 3: Bản thử nghiệm mới
  ];

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[AI] Attempting with model: ${modelName}...`);
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
      console.log(`[AI] Success with ${modelName}!`);
      
      return JSON.parse(cleanedText);

    } catch (error) {
      console.warn(`[AI] Model ${modelName} failed:`, error.message);
      lastError = error;
      // Nếu không phải lỗi 429 (hết lượt) hoặc lỗi kết nối, có thể model này không tồn tại, thử cái tiếp theo
      continue; 
    }
  }

  // Nếu đi hết vòng lặp mà vẫn lỗi
  console.error(`[AI] All models failed. Last error:`, lastError.message);
  if (lastError.message.includes("429")) {
    throw new Error("Tất cả các model AI đều hết lượt dùng miễn phí. Hãy thử lại sau vài phút!");
  }
  throw new Error(`AI Failure: ${lastError.message}`);
};

module.exports = { analyzeFoodImage };
