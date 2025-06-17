import OpenAI from 'openai';
import { LLMService, LLMResponse, ContentContext, MediaContent } from '../../core/domain/interfaces/llm.interface';
import config from '../../config';
import { Logger } from '../../scripts/logging/logger';

export class OpenAIService implements LLMService {
  private openai: OpenAI;
  private readonly logger: Logger;
  private readonly model: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
    this.logger = new Logger('OpenAIService');
    this.model = config.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  private async _generateContent(prompt: string): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media manager and content creator.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const processingTime = Date.now() - startTime;
      return {
        content: completion.choices[0].message.content || '',
        metadata: {
          tokens: completion.usage?.total_tokens,
          model: this.model,
          processingTime,
          cost: this.calculateCost(completion.usage?.total_tokens || 0)
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate content', { error });
      throw error;
    }
  }

  private calculateCost(tokens: number): number {
    // Basic cost calculation (can be made more sophisticated)
    const costPerToken = 0.00001; // Example rate
    return tokens * costPerToken;
  }

  async analyzeMedia(media: MediaContent): Promise<LLMResponse> {
    try {
      if (media.type === 'image' && media.metadata?.url) {
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing media content.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this media and describe its key elements:'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: media.metadata.url
                  }
                }
              ]
            }
          ],
          max_tokens: 200
        });

        return {
          content: response.choices[0].message.content || '',
          metadata: {
            tokens: response.usage?.total_tokens,
            model: this.model,
            processingTime: 0 // TODO: Add timing
          }
        };
      }
      throw new Error(`Unsupported media type: ${media.type}`);
    } catch (error) {
      this.logger.error('Failed to analyze media', { error });
      throw error;
    }
  }

  async generateComment(context: ContentContext): Promise<LLMResponse> {
    const prompt = `Generate an engaging comment for the following content:
    ${context.content}
    ${context.media?.length ? `Media Types: ${context.media.map(m => m.type).join(', ')}` : ''}
    Make it relevant, engaging, and encourage interaction.`;

    return this._generateContent(prompt);
  }

  async generateReply(context: ContentContext): Promise<LLMResponse> {
    const prompt = `Generate a reply to the following comment:
    Comment: ${context.content}
    ${context.metadata?.username ? `From: ${context.metadata.username}` : ''}
    Make it personal, conversational, and encourage further interaction.`;

    return this._generateContent(prompt);
  }

  async generateCaption(context: ContentContext): Promise<LLMResponse> {
    const prompt = `Generate a creative caption for the following content:
    ${context.content}
    ${context.media?.length ? `Media Types: ${context.media.map(m => m.type).join(', ')}` : ''}
    Make it engaging and include appropriate hashtags.`;

    return this._generateContent(prompt);
  }

  async generateSummary(context: ContentContext): Promise<LLMResponse> {
    const prompt = `Generate a concise summary of the following content:
    ${context.content}
    ${context.media?.length ? `Media Types: ${context.media.map(m => m.type).join(', ')}` : ''}
    Make it informative and capture the key points.`;

    return this._generateContent(prompt);
  }
} 