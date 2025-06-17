import { LLMService, ContentContext, MediaContent } from '../domain/interfaces/llm.interface';
import { Logger } from '../../scripts/logging/logger';

export class LLMInteractionService {
  private readonly llm: LLMService;
  private readonly logger: Logger;

  constructor(llm: LLMService) {
    this.llm = llm;
    this.logger = new Logger('LLMInteractionService');
  }

  /**
   * Analyzes media content and returns a description
   */
  async analyzeMedia(media: MediaContent): Promise<string> {
    try {
      const response = await this.llm.analyzeMedia(media);
      this.logger.info('Media analysis complete');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to analyze media', { error });
      throw error;
    }
  }

  /**
   * Generates a comment based on the content context
   */
  async generateComment(context: ContentContext): Promise<string> {
    try {
      const response = await this.llm.generateComment(context);
      this.logger.info('Comment generated successfully');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to generate comment', { error });
      throw error;
    }
  }

  /**
   * Generates a reply to a comment
   */
  async generateReply(context: ContentContext): Promise<string> {
    try {
      const response = await this.llm.generateReply(context);
      this.logger.info('Reply generated successfully');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to generate reply', { error });
      throw error;
    }
  }

  /**
   * Generates a caption for media content
   */
  async generateCaption(context: ContentContext): Promise<string> {
    try {
      const response = await this.llm.generateCaption(context);
      this.logger.info('Caption generated successfully');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to generate caption', { error });
      throw error;
    }
  }

  /**
   * Generates a summary of the content
   */
  async generateSummary(context: ContentContext): Promise<string> {
    try {
      const response = await this.llm.generateSummary(context);
      this.logger.info('Summary generated successfully');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to generate summary', { error });
      throw error;
    }
  }
} 