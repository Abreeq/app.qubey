import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  
});

export async function generateWithAi(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // ✅ safer extraction
    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.text?.() ||
      "";

    return text;
  } catch (err) {
    console.error("Gemini error:", err);
    throw err;
  }
}