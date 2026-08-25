import { GoogleGenAI } from '@google/genai';

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Ask Google Gemini API for real-time generative intelligence & response synthesis
 */
export async function askGeminiAssistant({ prompt, systemInstruction, contextData }) {
  try {
    const ai = getAiClient();
    if (!ai) {
      return null; // Fallback to database rule engine if GEMINI_API_KEY is not set
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction || 'You are NARVEX AI, the sovereign strategic narcotics intelligence copilot for Tamil Nadu Law Enforcement.'}\n\n[DATABASE CONTEXT TELEMETRY]:\n${JSON.stringify(contextData || {}, null, 2)}\n\n[USER QUERY]:\n${prompt}`
            }
          ]
        }
      ]
    });

    if (response && response.text) {
      return response.text.trim();
    }
    return null;
  } catch (err) {
    console.warn('Gemini API Warning (falling back to database engine):', err.message);
    return null;
  }
}
