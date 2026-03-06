export function extractJSON(text) {
  // Gemini sometimes returns ```json ... ```
  try {
    return JSON.parse(
      (text || "").replace(/```json/g, "").replace(/```/g, "").trim()
    );
  } catch {
    return null;
  }
}
