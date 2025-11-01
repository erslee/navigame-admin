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
  count: number;
  dynamicFields: string[];
}

export interface GeneratedPOI {
  name: string;
  address: string;
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
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', pricing: { prompt: '0', completion: '0' } },
        { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', pricing: { prompt: '0', completion: '0' } },
        { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', pricing: { prompt: '0', completion: '0' } },
        { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', pricing: { prompt: '0', completion: '0' } },
      ];
    }
  }

  async generatePOIs(params: GeneratePOIsParams): Promise<GeneratedPOI[]> {
    const client = this.getClient();

    const systemPrompt = `You are a helpful assistant that generates realistic Points of Interest (POI) data.
Generate ${params.count} POIs based on the user's description.

Each POI must include:
- name: The name of the POI
- address: A realistic street address in ${params.city}, ${params.country}
${params.dynamicFields.length > 0 ? `- ${params.dynamicFields.join('\n- ')}: Custom fields as described by the user` : ''}

Return ONLY a valid JSON array of POIs. Do not include any other text or markdown.

Example format:
[
  {
    "name": "Example Museum",
    "address": "123 Main St, ${params.city}, ${params.country}",
    "dynamicFields": {
      ${params.dynamicFields.map(f => `"${f}": "value for ${f}"`).join(',\n      ')}
    }
  }
]`;

    const userPrompt = `Generate ${params.count} Points of Interest for the category "${params.category}" in ${params.city}, ${params.country}.

${params.prompt}

${params.dynamicFields.length > 0 ? `Include these fields: ${params.dynamicFields.join(', ')}` : ''}

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

        return {
          name: poi.name,
          address: poi.address,
          dynamicFields: poi.dynamicFields || {},
        };
      });
    } catch (error) {
      console.error('Error generating POIs:', error);
      throw error;
    }
  }
}

export const openRouterService = new OpenRouterService();
