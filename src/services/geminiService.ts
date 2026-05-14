import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export async function getArrowAdvice(
  userPrompt: string, 
  history: Message[], 
  config: {
    bow_type: string;
    draw_weight: number;
    draw_length: number;
    arrow_length: number;
    point_weight: number;
    spine: number;
  }
) {
  const systemInstruction = `You are an expert Archery Equipment Specialist and Arrow Architect. 
Your goal is to provide technical, precise, and helpful advice based on the user's current arrow configuration.

CURRENT CONFIGURATION:
- Bow Type: ${config.bow_type}
- Draw Weight: ${config.draw_weight}#
- Draw Length: ${config.draw_length}"
- Arrow Length: ${config.arrow_length}"
- Point Weight: ${config.point_weight} grains
- Calculated Static Spine Required: ${config.spine}

TECHNICAL RULES:
1. If the arrow length is too short (shorter than draw length), warn about safety immediately.
2. Increasing point weight weakens the dynamic spine.
3. Increasing draw weight weakens the dynamic spine.
4. Longer arrows behave as if they have a weaker spine.
5. Use terms like "Dynamic Spine", "Archery Paradox", and "Node Alignment".

Keep responses concise, technical but accessible, and always prioritize safety. Use markdown for formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}

export const geminiService = {
  analyzeForm: async (base64Image: string) => {
    // Basic image analysis implementation for FormAnalyzer
    const prompt = `You are an expert archery coach. Analyze this archer's form from the side profile.
Focus on:
1. Anchor point consistency.
2. Back tension and elbow alignment.
3. Bow hand grip and torque.
4. Posture and balance.

Provide the analysis as a JSON object with:
- raw_analysis: A detailed markdown summary.
- issues: An array of specific faults found.
- recommendations: An array of corrective actions.

Return ONLY the JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Image.split(',')[1],
                  mimeType: "image/jpeg"
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Form Analysis Error:", error);
      throw error;
    }
  }
};
