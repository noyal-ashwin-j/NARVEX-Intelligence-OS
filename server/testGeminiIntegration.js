import dotenv from 'dotenv';
dotenv.config();

import { askGeminiAssistant } from './services/geminiService.js';

async function testGemini() {
  console.log('--- TESTING GOOGLE GEMINI API INTEGRATION ---');
  console.log('GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY);

  const prompt = 'Summarize narcotics preventive risk for Coimbatore district.';
  const systemInstruction = 'You are NARVEX AI, sovereign strategic intelligence copilot for Tamil Nadu Law Enforcement.';
  const contextData = { district: 'Coimbatore', risk: 'HIGH PREVENTIVE ATTENTION', velocity: '2.4x' };

  const result = await askGeminiAssistant({ prompt, systemInstruction, contextData });

  if (result) {
    console.log('✅ Google Gemini API Response received:\n', result);
  } else {
    console.log('ℹ️ Google Gemini API Key is not set or empty. Seamless fallback to NARVEX DB Rule Engine is active.');
  }

  process.exit(0);
}

testGemini();
