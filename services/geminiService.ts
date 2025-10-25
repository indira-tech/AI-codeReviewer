import { GoogleGenAI, Type } from "@google/genai";
import { Review } from "../App";

// Initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A comprehensive summary of the code review in Markdown format. It must include: a brief on the code's purpose, the overall score, the number of critical bugs, and the time complexity. Use emojis for engagement. Example: '📝 **Code Purpose:** ...\n-  ошибки: ...\n- 💯 **Score:** ...\n- ⏳ **Complexity:** ...'"
    },
    detailed: {
      type: Type.STRING,
      description: "A detailed, professional code review report in Markdown format. The review must be structured with specific '###' headings for different categories like 'Overall Score', 'Time Complexity Analysis', 'Identified Bugs and Errors', and 'Actionable Improvements & Best Practices'."
    }
  },
  required: ["summary", "detailed"]
};


export async function reviewCode(code: string, language: string): Promise<Review> {
  const langForPrompt = language === 'auto' ? 'Auto-detect' : language;
  
  const prompt = `
You are a world-class AI code reviewer. Your goal is to provide a comprehensive and helpful review of the user's code, formatted exactly as a professional report.

**CODE TO REVIEW:**
Language: ${langForPrompt}
\`\`\`${language === 'auto' ? 'text' : language}
${code}
\`\`\`

**RESPONSE FORMAT:**
You MUST respond with a JSON object that strictly adheres to the provided schema. The JSON object must contain two keys: "summary" and "detailed".

1.  **"summary"**: A comprehensive yet concise summary of the code review in Markdown format. It must contain the following information, using emojis for engagement:
    - **Code Purpose:** A one-sentence description of what the code does.
    - **Critical Issues:** A count of the most critical bugs found.
    - **Overall Score:** The score provided in the detailed report.
    - **Time Complexity:** The time complexity from the detailed report.

2.  **"detailed"**: A detailed, professional code review report in Markdown format. Structure your feedback using the following specific "###" headings and formats precisely. Omit any section that is not relevant.

    ### Overall Score
    Start with a paragraph that explains the score. This score reflects that the code is functional and correctly achieves its goal, but it could be significantly improved.

    ### Time Complexity Analysis
    - **Time Complexity:** Provide the Big O notation (e.g., O(1), O(n)).
    - **Reasoning:** Explain why the time complexity is what you say it is.
    - **Space Complexity:** Provide the Big O notation.
    - **Reasoning:** Explain why the space complexity is what you say it is.

    ### Identified Bugs and Errors
    If there are no bugs, state "No critical bugs or errors were identified." Otherwise, for each bug, provide a numbered list item with the following structure:
    1. **Issue:** A brief title for the bug.
       - **Describe the Issue:** A clear explanation of what the bug is.
       - **Explain the Impact in Detail:** Describe the consequences.
       - **Provide Remediation Strategies:**
         - **Primary Fix (Recommended):** Describe the best way to fix it. Provide a [Code Snippet].
         - **Alternative Fix:** Describe another way to fix it, if applicable. Provide a [Code Snippet].

    ### Actionable Improvements & Best Practices
    Provide a numbered list of improvements. For each item:
    1. **Clear Title (e.g., Avoid Shadowing Built-in Functions)**
       A paragraph explaining the improvement.
       [Code Snippet]

    ### Unit Tests
    Generate a concise suite of up to 3 basic unit tests for the most critical functions. For each test, provide sample input, the **predicted output**, and a brief explanation of the case being tested (e.g., standard input, edge cases). Format the tests using a standard framework for the detected language (e.g., Jest/Vitest for JavaScript/TypeScript, unittest or pytest for Python).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Received an empty response from the API.");
    
    const reviewResult = JSON.parse(text);
    if (typeof reviewResult.summary === 'string' && typeof reviewResult.detailed === 'string') {
        return reviewResult as Review;
    } else {
        throw new Error("API response does not match the expected format.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) throw new Error(`Gemini API error: ${error.message}`);
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
}

export async function addCommentsToCode(code: string, language: string): Promise<string> {
    const langForPrompt = language === 'auto' ? 'the auto-detected language' : language;

    const prompt = `
    You are an expert programmer tasked with documenting code.
    Your sole job is to add clear, concise, and helpful comments and docstrings to the following code.
    - Adhere strictly to the standard documentation conventions for ${langForPrompt} (e.g., JSDoc for JavaScript, PEP 257 for Python).
    - Add comments to explain complex logic.
    - Do not change any of the code's logic.
    - Your output MUST be only the complete, modified code with the added documentation.
    - Do NOT add any conversational text, explanations, or markdown code fences around your output.

    **CODE TO DOCUMENT:**
    \`\`\`${language === 'auto' ? 'text' : language}
    ${code}
    \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.1,
            },
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API while adding comments.");
        }
        return text;
    } catch (error) {
        console.error("Error calling Gemini API for adding comments:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while adding comments.");
    }
}