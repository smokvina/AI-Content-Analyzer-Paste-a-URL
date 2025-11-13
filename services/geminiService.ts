
import { GoogleGenAI } from "@google/genai";

const createAnalysisPrompt = (url: string): string => `
# AI Content Analysis & Enhancement

## 🎯 Primary Goal
Your task is to conduct a deep analysis of the content at the provided URL. Then, transform and enrich that content in five specific, structured ways. Format your entire response using clear Markdown.

## 1. 🌐 Source Input
Analyze the content found at: ${url}

## 2. 📝 FAQ Generation
Based on the entire content of the link, generate a minimum of 8 and a maximum of 12 Frequently Asked Questions (FAQs).
- **Format:** Use a clear "Question:" and "Answer:" format for each item.
- **Focus:** Questions must cover key information, main topics, and the most important actions or steps mentioned in the text.

## 3. 🧠 Content Analysis for AI Platforms
Perform a content analysis optimized for further use in AI platforms (like summarization models or chatbots).
- **Key Themes/Categories:** Identify a minimum of 5 main themes or categories (e.g., "Pricing," "Product Usage," "Contact Information").
- **Keyword Extraction:** Extract the top 15 relevant keywords and phrases. Present this as a Markdown table with two columns: "Keyword/Phrase" and "Relevance Score (1-10)".
- **Executive Summary:** Create a concise summary (max 3 sentences) that explains: What is this? Who is it for? What is the main benefit?

## 4. 🔄 Content Rewrite & Optimization
Rewrite the original content with the following improvements:
- **Tone:** Shift the tone to be engaging, professional, and direct.
- **Readability:** Simplify complex sentences and improve the structure for online readability (use subheadings and bullet points).
- **SEO Optimization:** Naturally integrate the most important keywords from your analysis.
- **Result:** Present the new, improved version of the complete content.

## 5. ✨ AI Gap Recommendation
Identify and provide a concrete recommendation for a part of the task or analysis that an AI cannot immediately or automatically perform based solely on the provided link.
- **Focus:** The recommendation should be aimed at necessary human intervention, validation, or additional information not explicitly in the content.
- **Example Areas:**
    - **Emotional Tone:** "A human should review the rewritten content for subtle emotional nuances and cultural slang to ensure it resonates with the target [specify region] audience."
    - **Data Validation:** "The pricing/contact information should be manually verified against external sources to ensure it is up-to-date, as this data can change frequently."
    - **Strategic Insight:** "To create a targeted marketing plan from this content, a human strategist is needed to analyze current market trends and competitor positioning, which is outside the scope of this text."

## 💡 Final Output Formatting
Structure your final response using Markdown headings, lists, and tables to ensure it is clear, well-organized, and ready to be copied.
`;

export const analyzeUrl = async (url: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please ensure the API_KEY environment variable is set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = createAnalysisPrompt(url);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing URL with Gemini:", error);
    
    let errorMessage = "An unknown error occurred while communicating with the Gemini API.";

    if (error instanceof Error) {
        errorMessage = error.message;
    }

    // The Gemini API can sometimes wrap its error in a JSON string within the message.
    // Let's try to parse it for a cleaner error.
    try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError?.error?.message) {
            errorMessage = parsedError.error.message;
        }
    } catch (e) {
        // Not a JSON string, proceed with the original message.
    }

    const lowerCaseMessage = errorMessage.toLowerCase();
    if (lowerCaseMessage.includes('429') || lowerCaseMessage.includes('rate limit')) {
         throw new Error(`Gemini API rate limit exceeded. Please wait and try again. Original: ${errorMessage}`);
    }
    if (lowerCaseMessage.includes('api key not valid')) {
        throw new Error(`The provided API key is not valid. Please check your configuration. Original: ${errorMessage}`);
    }
    
    throw new Error(`Gemini API call failed: ${errorMessage}`);
  }
};
