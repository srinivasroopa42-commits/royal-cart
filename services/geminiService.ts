
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const TEXT_MODEL = "gemini-3-flash-preview";
const MAPS_MODEL = "gemini-2.5-flash";

/**
 * Suggests recipes based on a list of ingredients (usually from the cart).
 */
export const suggestRecipes = async (ingredients: string[]): Promise<any> => {
  if (ingredients.length === 0) return [];

  const prompt = `
    I have the following ingredients: ${ingredients.join(', ')}.
    Suggest 3 simple recipes I can make primarily using these, plus common pantry staples (salt, oil, pepper).
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              missingIngredients: {
                 type: Type.ARRAY,
                 items: { type: Type.STRING },
                 description: "Ingredients needed but not in the user's list"
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return [];
  }
};

/**
 * Smart Shop: Converts a user request (e.g., "I want to make Lasagna") into a list of ingredients
 * that can be mapped to our product catalog tags.
 */
export const smartShopAssist = async (query: string): Promise<string[]> => {
  const prompt = `
    The user wants to buy items for: "${query}".
    List individual generic ingredients needed for this.
    Keep it to the top 5-8 essential ingredients.
    Return ONLY a JSON array of strings.
    Example: ["pasta sheets", "tomato sauce", "ground beef", "cheese", "onion"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: { type: Type.STRING }
        }
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Smart Shop Error:", error);
    return [];
  }
};

export interface AddressSuggestion {
  address: string;
  uri?: string;
  title?: string;
}

/**
 * Address Auto-complete using Google Maps Grounding.
 * Provides accurate real-world addresses including building numbers and precise units.
 */
export const getAddressSuggestions = async (
  input: string, 
  location?: { lat: number; lng: number }
): Promise<AddressSuggestion[]> => {
  if (input.length < 2) return [];

  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng
        }
      }
    };
  }

  const prompt = `
    Find 5 extremely precise, real-world delivery addresses or landmark buildings based on: "${input}". 
    You MUST include building names, specific house/flat numbers (e.g., #402, B-Block), street names, and area pin codes.
    Focus on accuracy for delivery purposes.
    Format your response as a clear list of full addresses.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MAPS_MODEL,
      contents: prompt,
      config,
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URIs from grounding chunks
    const mapLinks = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        uri: chunk.maps.uri,
        title: chunk.maps.title
      }));

    // Split text into lines to find address strings
    const lines = text.split('\n').filter(line => line.trim().length > 5);
    
    // Map lines to suggestions and attach links if they match titles
    const suggestions: AddressSuggestion[] = lines.slice(0, 5).map((line, index) => {
      const cleanAddress = line.replace(/^\d+[\.\)]\s*/, '').trim();
      return {
        address: cleanAddress,
        uri: mapLinks[index]?.uri,
        title: mapLinks[index]?.title
      };
    });

    return suggestions;
  } catch (error) {
    console.error("Gemini Maps Address Error:", error);
    return [];
  }
};
