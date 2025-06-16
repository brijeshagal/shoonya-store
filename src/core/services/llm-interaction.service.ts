import { LLMService, SocialContext, MediaContent } from '../domain/interfaces/llm.interface';
import { InstagramService, InstagramPost, InstagramComment } from '../domain/interfaces/instagram.interface';
import { Logger } from '../../scripts/logging/logger';

export class LLMInteractionService {
  private readonly llm: LLMService;
  private readonly instagram: InstagramService;
  private readonly logger: Logger;

  constructor(llm: LLMService, instagram: InstagramService) {
    this.llm = llm;
    this.instagram = instagram;
    this.logger = new Logger('LLMInteractionService');
  }

  private createSocialContext(post: InstagramPost, comments?: InstagramComment[]): SocialContext {
    const media: MediaContent[] = [];
    
    // Add image if available
    if (post.mediaType === 1 && post.rawData?.image_versions2?.candidates?.[0]?.url) {
      media.push({
        type: 'image',
        content: post.rawData.image_versions2.candidates[0].url,
        metadata: {
          url: post.rawData.image_versions2.candidates[0].url,
          mimeType: 'image/jpeg'
        }
      });
    }

    return {
      platform: 'instagram',
      contentType: 'post',
      contentId: post.id,
      author: {
        id: post.user.id,
        username: post.user.username,
        displayName: post.user.fullName
      },
      text: post.caption,
      media,
      metadata: {
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        mediaType: post.mediaType
      }
    };
  }

  async processPostWithLLM(postId: string): Promise<void> {
    try {
      // Get post details
      const post = await this.instagram.getPostById(postId);
      const comments = await this.instagram.getComments(postId);

      // Create context for LLM
      const context = this.createSocialContext(post, comments);

      // Generate comment using LLM
      const commentResponse = await this.llm.generateContent(context, 'comment');
      this.logger.info(`Generated comment: ${commentResponse.content}`);

      // Post the generated comment
      const result = await this.instagram.postComment(postId, commentResponse.content);
      if (!result.success) {
        throw new Error(`Failed to post comment: ${result.message}`);
      }

      // Process comments with LLM
      for (const comment of comments) {
        const replyContext: SocialContext = {
          ...context,
          contentType: 'comment',
          contentId: comment.id,
          text: comment.text,
          author: {
            username: comment.username
          }
        };

        const replyResponse = await this.llm.generateContent(replyContext, 'reply');
        this.logger.info(`Generated reply: ${replyResponse.content}`);

        const replyResult = await this.instagram.replyToComment(postId, comment.id, replyResponse.content);
        if (!replyResult.success) {
          this.logger.error(`Failed to reply to comment ${comment.id}`, { error: replyResult.message });
        }
      }
    } catch (error) {
      this.logger.error('Failed to process post with LLM', { error, postId });
      throw error;
    }
  }

  async analyzeAndCaptionPost(postId: string): Promise<string> {
    try {
      const post = await this.instagram.getPostById(postId);
      const context = this.createSocialContext(post);
      
      // Analyze media if available
      if (context.media?.length) {
        const analysis = await this.llm.analyzeMedia(context.media[0]);
        this.logger.info(`Media analysis complete: ${analysis.content}`);

        // Generate caption based on analysis
        const captionResponse = await this.llm.generateContent(context, 'caption');
        return captionResponse.content;
      }

      throw new Error('Post does not contain media to analyze');
    } catch (error) {
      this.logger.error('Failed to analyze and caption post', { error, postId });
      throw error;
    }
  }

  async generateEngagementStrategy(postId: string): Promise<string> {
    try {
      const post = await this.instagram.getPostById(postId);
      const context = this.createSocialContext(post);
      
      const engagementResponse = await this.llm.generateEngagement(context);
      return engagementResponse.content;
    } catch (error) {
      this.logger.error('Failed to generate engagement strategy', { error, postId });
      throw error;
    }
  }
} 