import OpenAI from 'openai';

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface GeneratePOIsParams {
  model: string;
  prompt: string;
  country: string;
  city: string;
  category: string;
  dynamicFields: string[];
}

export interface GeneratedPOI {
  name: string;
  address: string;
  geolocation: {
    latitude: number;
    longitude: number;
  };
  dynamicFields: Record<string, string>;
}

class OpenRouterService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        dangerouslyAllowBrowser: true, // Required for client-side usage
      });
    }

    return this.client;
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();

      // Filter and format models
      return data.data
        .filter((model: any) => !model.id.includes('free')) // Filter out free models for better quality
        .map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          pricing: {
            prompt: model.pricing?.prompt || '0',
            completion: model.pricing?.completion || '0',
          },
        }))
        .sort((a: OpenRouterModel, b: OpenRouterModel) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching models:', error);
      // Return some default popular models if fetch fails
      return [
        { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', pricing: { prompt: '0', completion: '0' } },
        { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', pricing: { prompt: '0', completion: '0' } },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', pricing: { prompt: '0', completion: '0' } },
        { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', pricing: { prompt: '0', completion: '0' } },
        { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', pricing: { prompt: '0', completion: '0' } },
      ];
    }
  }

  async generatePOIs(params: GeneratePOIsParams): Promise<GeneratedPOI[]> {
    const client = this.getClient();

    const systemPrompt = `You are a helpful assistant that generates realistic Points of Interest (POI) data.
Generate ALL relevant POIs that match the user's description for the specified category and location. Include as many POIs as you can think of that fit the criteria - be comprehensive and thorough.

Each POI must include:
- name: The name of the POI
- address: A realistic street address in ${params.city}, ${params.country}
- geolocation: An object with latitude and longitude (realistic coordinates for ${params.city}, ${params.country})
  - latitude: number (e.g., 48.8566 for Paris)
  - longitude: number (e.g., 2.3522 for Paris)
- dynamicFields: An object that MUST always include:
  - description: A short 1-2 sentence description of the POI (REQUIRED)
${params.dynamicFields.length > 0 ? `  - ${params.dynamicFields.join('\n  - ')}: Additional custom fields as described by the user` : ''}

Return ONLY a valid JSON array of POIs. Do not include any other text or markdown.

Example format:
[
  {
    "name": "Example Museum",
    "address": "123 Main St, ${params.city}, ${params.country}",
    "geolocation": {
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "dynamicFields": {
      "description": "A world-renowned museum featuring classical art and historical artifacts from ancient civilizations.",
      ${params.dynamicFields.map(f => `"${f}": "value for ${f}"`).join(',\n      ')}
    }
  }
]`;

    const userPrompt = `Generate ALL Points of Interest for the category "${params.category}" in ${params.city}, ${params.country}.

${params.prompt}

IMPORTANT: Each POI must have a "description" field in dynamicFields with a short 1-2 sentence description.
${params.dynamicFields.length > 0 ? `Additionally, include these fields: ${params.dynamicFields.join(', ')}` : ''}

Return ONLY the JSON array, no other text.`;

    try {
      const response = await client.chat.completions.create({
        model: params.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI');
      }

      // Extract JSON from response (handle markdown code blocks)
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const pois = JSON.parse(jsonContent);

      if (!Array.isArray(pois)) {
        throw new Error('Response is not an array');
      }

      // Validate and clean the POIs
      return pois.map((poi) => {
        if (!poi.name || !poi.address) {
          throw new Error('Invalid POI structure: missing name or address');
        }

        if (!poi.geolocation || typeof poi.geolocation.latitude !== 'number' || typeof poi.geolocation.longitude !== 'number') {
          throw new Error('Invalid POI structure: missing or invalid geolocation');
        }

        // Ensure dynamicFields exists and has description
        const dynamicFields = poi.dynamicFields || {};
        if (!dynamicFields.description || typeof dynamicFields.description !== 'string') {
          throw new Error('Invalid POI structure: missing description in dynamicFields');
        }

        return {
          name: poi.name,
          address: poi.address,
          geolocation: {
            latitude: poi.geolocation.latitude,
            longitude: poi.geolocation.longitude,
          },
          dynamicFields,
        };
      });
    } catch (error) {
      console.error('Error generating POIs:', error);
      throw error;
    }
  }
}

export const openRouterService = new OpenRouterService();
