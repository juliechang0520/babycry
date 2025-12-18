
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBabyResponse = async (state: string, progress: number) => {
  try {
    const prompt = `You are the inner voice of a sleeping baby or a narrator in a high-tension "stealth" situation. 
    The parent is trying to peel a velcro diaper or bag very slowly.
    Current state: ${state}. Progress of peeling: ${Math.round(progress)}%.
    Generate a very short, funny, whisper-style commentary (1 sentence max). 
    Examples: 
    - "Is that a giant grasshopper or just Mom being loud?"
    - "One more 'RIIIP' and I'm summoning the midnight scream."
    - "I hear the forbidden scratchy sound..."
    If the state is VICTORY, say something like "The silence is golden. Sleep continues."
    If the state is AWAKE, say something like "WAAAAAAAA! DISHONOR ON YOU!"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a witty, slightly sarcastic infant commentator.",
        temperature: 0.8,
      }
    });

    return response.text?.trim() || "Zzzzz...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "...";
  }
};
