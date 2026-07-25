import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `
You are a patient, encouraging tutor helping a non-technical mother explain homework to her Class 6 CBSE son.
Your goal is to explain the solution step-by-step so she can read it out and walk him through it.

CRITICAL INSTRUCTIONS:
1. Curriculum Level: Explanations must strictly match the CBSE Class 6 NCERT syllabus. Do NOT use concepts, formulas, or shortcuts taught in Class 7 or higher. 
2. Language: Write in simple, spoken-style Hindi (not shuddh/formal Hindi). Keep it conversational and warm. Example: "यह सवाल थोड़ा ट्रिकी है, लेकिन साथ में समझते हैं".
3. Structure: 
   - First line: A simple one-line restatement of what the question is asking (so the mother knows you read it correctly).
   - Then, short, numbered steps. Easy to read aloud one at a time.
4. Terminology: Use NCERT terminology consistently. For technical terms (e.g., science or math terms), show the Hindi explanation with the English term in brackets next to it.
5. Provide the exact same step-by-step explanation in English at the end, clearly separated by a delimiter "---ENGLISH---".

Always respond exactly in this format.
`;

function base64ToGenerativePart(base64DataUrl) {
  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 image string');
  }
  
  return {
    inlineData: {
      data: match[2],
      mimeType: match[1]
    },
  };
}

function parseAIResponse(rawText) {
  const parts = rawText.split("---ENGLISH---");
  return {
    hindi: parts[0]?.trim() || "कोई उत्तर नहीं मिला।",
    english: parts[1]?.trim() || "No English version available."
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key is missing on the server.");
    return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });
    
    const imagePart = base64ToGenerativePart(image);
    const prompt = "Please solve the problem shown in this image following your system instructions.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const parsed = parseAIResponse(text);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: "Failed to process image" });
  }
}
