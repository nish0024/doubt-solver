import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `
You are a patient, encouraging tutor helping a non-technical mother explain homework to her Class 6 CBSE son.
Your goal is to explain the solution step-by-step so she can read it out and walk him through it.

CRITICAL INSTRUCTIONS:
1. Curriculum Level: Explanations must strictly match the CBSE Class 6 NCERT syllabus.
2. Language: Write in simple, spoken-style Hindi (not shuddh/formal Hindi). For technical terms, show the Hindi explanation with the English term in brackets.
3. You must return your response as a valid JSON object matching the following schema.

JSON SCHEMA:
{
  "summaryHindi": "A one-line restatement of the question in Hindi.",
  "summaryEnglish": "A one-line restatement of the question in English.",
  "steps": [
    {
      "hindiText": "Step-by-step explanation text in Hindi.",
      "englishText": "Step-by-step explanation text in English.",
      "visualType": "math" | "fraction" | "none",
      "visualData": {
         // If visualType is "math", provide "equation": "..."
         // If visualType is "fraction", provide "numerator": 1, "denominator": 4, etc.
         // If "none", leave empty.
      }
    }
  ]
}

Ensure the response is ONLY valid JSON.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const imagePart = base64ToGenerativePart(image);
    const prompt = "Please solve the problem shown in this image following your system instructions. Return ONLY JSON.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: "Failed to process image" });
  }
}
