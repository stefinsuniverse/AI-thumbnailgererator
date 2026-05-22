import { GoogleGenAI } from "@google/genai";

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY
});

export default googleGenAI;
