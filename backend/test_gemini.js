const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function list() {
  // Try forcing v1 API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-1.5-flash"];
  for (const m of models) {
    try {
      console.log(`Probing ${m}...`);
      // The JS SDK doesn't expose a simple way to switch to v1 in the constructor 
      // but we can try to use the full resource name
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`Success with ${m}`);
      return;
    } catch (e) {
      console.error(`Failed with ${m}:`, e.message);
    }
  }
}
list();
