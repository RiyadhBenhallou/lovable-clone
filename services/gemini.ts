import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedResponse, Message } from "../types";

// Initialize the Gemini API client
// CRITICAL: The API key must be provided via the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert AI web developer and UI/UX designer. Your task is to build and iterate on single-file HTML applications based on user prompts.

Rules:
1. Output specific, complete, and functional HTML code.
2. Include all CSS (in <style> tags) and JavaScript (in <script> tags) within the single HTML string.
3. Use modern design principles (flexbox, grid, nice typography, shadows, rounded corners).
4. Do not include external CSS/JS files unless they are CDN links to popular libraries (e.g., FontAwesome, Google Fonts, Tailwind via CDN).
5. If the user asks for changes, you MUST return the FULL updated HTML code, not just the snippets that changed.
6. **CRITICAL:** Output properly formatted HTML with 2-space indentation. Do not minify the code.
7. Your response must be a JSON object with two fields:
   - "message": A short, friendly explanation of what you built or changed (e.g., "I created a calculator with a dark theme.").
   - "html": The complete HTML string.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "A short explanation of the changes or the build."
    },
    html: {
      type: Type.STRING,
      description: "The full HTML code for the application."
    }
  },
  required: ["message", "html"],
};

export const generateAppCode = async (
  prompt: string,
  history: Message[],
  currentCode: string | null
): Promise<GeneratedResponse> => {
  try {
    const model = "gemini-2.5-flash"; // Using Flash for speed and efficiency with code

    // Construct the prompt context
    let fullPrompt = `User Request: ${prompt}\n`;
    
    if (currentCode) {
        fullPrompt += `\nCurrent Code Context:\n\`\`\`html\n${currentCode}\n\`\`\`\n`;
        fullPrompt += `\nTask: Update the code above based on the user request. Return the full valid HTML.`;
    } else {
        fullPrompt += `\nTask: Create a new single-file HTML application based on the user request.`;
    }

    // Convert history to format expected by Gemini (if needed for context), 
    // but here we are treating each request as a generateContent with context in the prompt 
    // to ensure we strictly follow the schema and "full code" requirement.
    // However, for better conversational flow, let's include recent history in the prompt text.
    
    if (history.length > 0) {
        const recentHistory = history.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        fullPrompt = `Conversation History:\n${recentHistory}\n\n` + fullPrompt;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Balance between creativity and code correctness
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(responseText) as GeneratedResponse;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};