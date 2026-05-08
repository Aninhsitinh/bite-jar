const axios = require('axios');
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  try {
    console.log(`[AI] Starting analysis in Vercel Region...`);
    
    // Sử dụng v1beta và gemini-1.5-flash-latest để có độ tương thích cao nhất
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Bạn là một chuyên gia dinh dưỡng. Hãy phân tích ảnh món ăn này. Trả về DUY NHẤT một chuỗi JSON thuần túy (không có markdown ```json) với cấu trúc: {\"food_name\": \"...\", \"calories_estimate\": 0, \"category\": \"balanced\", \"fat_level\": 5, \"short_feedback\": \"...\"}. Ngôn ngữ: Tiếng Việt." },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBuffer.toString("base64")
            }
          }
        ]
      }]
    };

    const response = await axios.post(url, payload, { 
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      const text = response.data.candidates[0].content.parts[0].text;
      const cleanedText = text.replace(/```json|```/g, "").trim();
      console.log(`[AI] Success: ${cleanedText.substring(0, 50)}...`);
      return JSON.parse(cleanedText);
    }
    
    console.error("[AI] Unexpected Response Structure:", JSON.stringify(response.data));
    throw new Error("No response from AI candidates");

  } catch (error) {
    const status = error.response ? error.response.status : 'Error';
    const data = error.response ? error.response.data : null;
    
    console.error(`[AI] Failed Status: ${status}`);
    if (data) console.error(`[AI] Google Error Details:`, JSON.stringify(data));
    
    throw new Error(`AI failed (${status}). Check Vercel logs for Google Error Details.`);
  }
};

module.exports = { analyzeFoodImage };
