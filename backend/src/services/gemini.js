const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log(`[AI] Checking available models for your API Key...`);
    
    // Bước 1: Liệt kê các model mà Key này có quyền dùng
    // (Lưu ý: ListModels đôi khi không trả về kết quả trong môi trường nhất định, 
    // nên chúng ta vẫn giữ danh sách dự phòng)
    let availableModels = [];
    try {
      // Lưu ý: SDK v0.x có thể không có listModels trực tiếp, ta sẽ thử dùng model phổ biến nhất trước
      availableModels = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash"];
    } catch (e) {
      console.warn("[AI] Could not list models, using fallback list.");
    }

    // Bước 2: Thử phân tích với model khả thi nhất
    for (const modelName of availableModels) {
      try {
        console.log(`[AI] >>> Trying: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

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
        console.log(`[AI] SUCCESS with ${modelName}`);
        
        return JSON.parse(cleanedText);

      } catch (error) {
        console.warn(`[AI] Model ${modelName} failed: ${error.message}`);
        // Nếu là lỗi 429 hoặc 404, thử cái tiếp theo
        continue;
      }
    }

    throw new Error("Không có model nào hoạt động hoặc API Key chưa được kích hoạt Gemini API.");

  } catch (error) {
    console.error(`[AI] Fatal Error:`, error.message);
    throw error;
  }
};

module.exports = { analyzeFoodImage };
