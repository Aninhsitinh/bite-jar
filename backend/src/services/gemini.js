const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Bạn là một chuyên gia đánh giá dinh dưỡng nghiêm khắc nhưng hài hước.
Hãy phân tích hình ảnh thức ăn được cung cấp và TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ theo đúng cấu trúc sau:
{
  "food_name": "Tên món ăn dự đoán",
  "calories_estimate": [Số nguyên ước lượng calo],
  "category": "healthy / oily / sweet / balanced",
  "fat_level": [Số nguyên từ 1 đến 10 mô tả độ dầu mỡ],
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
  
  try {
    // Clean up text in case Gemini adds markdown or whitespace
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Invalid AI response structure");
  }
};

module.exports = { analyzeFoodImage };
