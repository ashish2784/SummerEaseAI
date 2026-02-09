
import { GoogleGenAI } from "@google/genai";

// Use the standard initialization pattern
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

/**
 * Summarizes content using high-fidelity strategic analysis.
 * Uses gemini-3-flash-preview for superior document handling and speed.
 */
export async function summarizeContent(content: string, type: string, filePart?: FilePart): Promise<string> {
  const ai = getAI();
  
  const systemInstruction = `
    You are a Strategic Intelligence Analyst for a high-level executive vault.
    
    TASK: Synthesize the provided ${type} into a concise, actionable BRIEFING.
    
    OUTPUT STRUCTURE (Strictly follow this):
    1. **EXECUTIVE THESIS**: A single bolded sentence defining the document's core purpose.
    2. **PRIMARY INSIGHTS**:
       - [Insight]: [Implication] (Brief and punchy)
       - [Insight]: [Implication] (Brief and punchy)
       - [Insight]: [Implication] (Brief and punchy)
    3. **VERDICT**: A one-sentence final strategic takeaway.

    CRITICAL RULES:
    - IGNORE all structural artifacts, page markers (e.g., "[PAGE X]"), headers, footers, and OCR extraction noise.
    - DO NOT include nonsensical characters, broken formatting markers, or technical meta-tags.
    - If the input is fragmented, reconstruct the semantic meaning into a coherent summary.
    - NO greetings, NO intro, NO conversational filler.
    - Use Markdown for hierarchy.
    - Maximum word count: 120 words. Be ruthless with fluff.
    - Tone: Objective, high-density, professional.
  `;

  const parts: any[] = [];
  if (filePart) {
    parts.push(filePart);
  }
  
  parts.push({ 
    text: `Analyze this content for strategic value. Ignore noise. Source Content: ${content || "Document provides visual data only."}` 
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.1,
        topP: 0.9,
      }
    });

    const result = response.text?.trim();
    if (!result) throw new Error("EMPTY_AI_RESPONSE");
    return result;
  } catch (error: any) {
    console.error("Gemini Critical Error:", error);
    if (error.message?.includes('429')) throw new Error("Rate limit exceeded. Please wait a moment.");
    if (error.message?.includes('400')) throw new Error("Analysis failed. The content might be too complex.");
    throw new Error("Analysis engine failed. Please try a smaller file or plain text.");
  }
}

export async function generateTitle(content: string, filePart?: FilePart): Promise<string> {
  const ai = getAI();
  const systemInstruction = "Identify the core subject. Return a 3-5 word formal title. NO punctuation. NO noise.";
  
  const parts: any[] = [];
  if (filePart) parts.push(filePart);
  parts.push({ text: content.substring(0, 1000) });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: { systemInstruction, temperature: 0.2 }
    });
    return response.text?.replace(/[#*"]/g, '').trim() || "Untitled Directory Entry";
  } catch {
    return "New Intel Report";
  }
}
