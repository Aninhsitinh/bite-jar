const axios = require('axios');
require('dotenv').config();

const analyzeFoodImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  try {
    // 1. Bước dò tìm: Hỏi Google xem Key này được dùng model nào
    console.log("[AI-Scanner] Scanning for available models...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await axios.get(listUrl);
    
    // Lọc ra các model hỗ trợ "generateContent" và có Vision (thường là bản Flash hoặc Pro)
    const availableModels = listResponse.data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name); // Tên có dạng "models/gemini-..."

    console.log(`[AI-Scanner] Found ${availableModels.length} models: ${availableModels.join(', ')}`);

    if (availableModels.length === 0) throw new Error("No models available for this API Key.");

    // 2. Thử lần lượt các model tìm được
    let lastError = null;
    for (const fullModelName of availableModels) {
      try {
        console.log(`[AI-Scanner] Testing ${fullModelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/${fullModelName}:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [{
            parts: [
              { text: "Bạn là một chuyên gia dinh dưỡng. Phân tích món ăn và trả về JSON: {\"food_name\": \"...\", \"calories_estimate\": 0, \"category\": \"balanced\", \"fat_level\": 5, \"short_feedback\": \"...\"}" },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBuffer.toString("base64")
                }
              }
            ]
          }]
        };

        const response = await axios.post(url, payload, { timeout: 20000 });
        if (response.data && response.data.candidates) {
          const text = response.data.candidates[0].content.parts[0].text;
          const cleanedText = text.replace(/```json|```/g, "").trim();
          console.log(`[AI-Scanner] Success with ${fullModelName}!`);
          return JSON.parse(cleanedText);
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AI-Scanner] ${fullModelName} failed.`);
      }
    }
    throw lastError;

  } catch (error) {
    const status = error.response ? error.response.status : 'Error';
    console.error(`[AI-Scanner] Fatal error (${status}): ${error.message}`);
    throw new Error("AI Scanner failed. Please try changing Render region to Oregon (US).");
  }
};

module.exports = { analyzeFoodImage };
