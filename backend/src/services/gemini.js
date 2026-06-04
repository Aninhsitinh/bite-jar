const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// 1. Singleton Pattern: Khởi tạo và lưu trữ instance để không bị memory leak hay khởi tạo lại nhiều lần
let genAIInstance = null;
function getGenAI() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!genAIInstance && apiKey) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  try {
    const genAI = getGenAI();
    if (!genAI) throw new Error("AI service not configured (GEMINI_API_KEY is missing)");
    
    console.log(`[AI] Initializing model for image analysis...`);
    
    // 2. Cấu hình Safety Settings: Giảm thiểu rủi ro AI từ chối trả lời vì nhầm lẫn ảnh món ăn với nội dung độc hại
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest', 
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    });

    // 3. Prompt chuẩn xác hơn, yêu cầu không trả về markdown
    const prompt = `Bạn là một chuyên gia dinh dưỡng. Phân tích ảnh món ăn và trả về kết quả dưới dạng JSON hợp lệ (không chứa markdown, không có code blocks).
Cấu trúc JSON bắt buộc:
{"food_name": "Tên món ăn", "calories_estimate": 0, "category": "balanced", "fat_level": 5, "short_feedback": "Đánh giá ngắn gọn"}
Ngôn ngữ: Tiếng Việt.`;

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
    let responseText = response.text().trim();
    
    // 4. Tiền xử lý kết quả: Strip markdown code blocks an toàn như trong code mẫu
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsedData = JSON.parse(responseText);
    console.log(`[AI] SUCCESS with gemini-flash-latest`);
    
    return parsedData;

  } catch (error) {
    console.error(`[AI] Gemini analysis failed:`, error.message);
    
    // 5. Fail-safe Mechanism (Cơ chế an toàn trên production)
    // Nếu AI bị sập hoặc quá tải (429), API vẫn trả về kết quả giả lập để hệ thống không bị "chết" (HTTP 500)
    return {
      food_name: "Không thể phân tích bằng AI",
      calories_estimate: 0,
      category: "unknown",
      fat_level: 0,
      short_feedback: "Hệ thống AI đang tạm thời gián đoạn, nhưng ảnh của bạn đã được lưu lại.",
      error: error.message
    };
  }
};

module.exports = { analyzeFoodImage };
