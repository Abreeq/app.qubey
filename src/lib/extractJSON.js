export function extractJSON(text) {
  // Gemini sometimes returns ```json ... ```
  return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
}