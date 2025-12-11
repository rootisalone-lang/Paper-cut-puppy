import { GoogleGenAI } from "@google/genai";

export const generatePuppyImage = async (): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const model = "gemini-2.5-flash-image";
  
  // Adjusted prompt to ensure high contrast for easier background removal
  // Added "facing right" to ensure the sprite direction matches the movement logic
  const prompt = "A vibrant red Chinese paper-cut puppy, full body, side view facing right, running pose or playful pose. The style should be traditional folk art with intricate cutout patterns. Isolate on a flat, pure brilliant white background. High contrast, no shadows on the background.";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response.");

  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};