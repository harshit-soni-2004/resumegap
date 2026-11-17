import { GoogleGenAI } from '@google/genai';

import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
}

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set in environment or .env.local');
    process.exit(1);
  }
  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
  });

  const start = Date.now();
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say hi in JSON format: {"message": "hello"}',
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 200,
    },
  });

  console.log('Latency with thinkingBudget=0:', Date.now() - start, 'ms');
  console.log('Output:', res.text);
}

test().catch(console.error);
