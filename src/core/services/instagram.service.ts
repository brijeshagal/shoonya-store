import { Logger } from '../../scripts/logging/logger';
import { DatabaseService } from '../domain/interfaces/database.interface';
import { InstagramComment, InstagramInteractionResult, InstagramPost, InstagramService, InstagramUser } from '../domain/interfaces/instagram.interface';
import { LLMInteractionService } from './llm-interaction.service';
import { ContentContext, MediaContent } from '../domain/interfaces/llm.interface';

export class InstagramInteractionService {
  private readonly instagram: InstagramService;
  private readonly database: DatabaseService;
  private readonly logger: Logger;
  private readonly llmService: LLMInteractionService;

  constructor(instagram: InstagramService, database: DatabaseService, llmService: LLMInteractionService) {
    this.instagram = instagram;
    this.database = database;
    this.logger = new Logger('InstagramInteractionService');
    this.llmService = llmService;
  }

  private createContentContext(post: InstagramPost): ContentContext {
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
      type: 'post',
      content: post.caption || '',
      media,
      metadata: {
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        mediaType: post.mediaType
      }
    };
  }

  async processNewPosts(username: string = "shoonya_store", limit: number = 5): Promise<{ processed: number; username: string }> {
    try {
      this.logger.info(`Starting to process posts for @${username} (limit: ${limit})`);
      
      const posts = await this.instagram.getRecentPosts(username, limit);
      this.logger.info(`Found ${posts.length} posts to process`);

      for (const post of posts) {
        this.logger.info(`\nProcessing post ${post.id}:`);
        this.logger.info(`- Caption: ${post.caption?.substring(0, 50)}...`);
        this.logger.info(`- Taken at: ${post.takenAt.toISOString()}`);
        
        const isCommented = await this.database.isPostCommented(post.id);
        if (isCommented) {
          this.logger.info(`Post ${post.id} already commented, skipping...`);
          await this.processComments(post.id, username);
          continue;
        }
        
        try {
          // Create content context for LLM
          const context = this.createContentContext(post);
          
          // Generate comment using LLM
          const comment = await this.llmService.generateComment(context);
          this.logger.info(`Generated comment: ${comment}`);

          // Post the comment
          const result = await this.instagram.postComment(post.id, comment);
          if (result.success) {
            await this.database.addCommentedPost(post.id, username, comment);
            this.logger.info(`Successfully commented on post ${post.id}`);
            await this.processComments(post.id, username);
          } else {
            this.logger.error(`Failed to comment on post ${post.id}: ${result.message}`);
          }
        } catch (error) {
          this.logger.error(`Error processing post ${post.id}`, error);
        }
      }

      return {
        processed: posts.length,
        username
      };
    } catch (error) {
      this.logger.error('Error processing posts', error);
      throw error;
    }
  }

  async processComments(postId: string, username: string): Promise<void> {
    try {
      this.logger.info(`Processing comments for post ${postId}`);
      const comments = await this.instagram.getComments(postId);
      this.logger.info(`Found ${comments.length} comments to process`);

      for (const comment of comments) {
        const isReplied = await this.database.isCommentReplied(comment.id);
        if (isReplied) {
          this.logger.info(`Comment ${comment.id} already replied to, skipping...`);
          continue;
        }

        try {
          // Create content context for reply
          const context: ContentContext = {
            type: 'comment',
            content: comment.text,
            metadata: {
              username: comment.username
            }
          };

          // Generate reply using LLM
          const reply = await this.llmService.generateReply(context);
          this.logger.info(`Generated reply: ${reply}`);

          // Post the reply
          const result = await this.instagram.replyToComment(postId, comment.id, reply);
          if (result.success) {
            await this.database.addCommentInteraction(comment.id, postId, username, reply);
            this.logger.info(`Successfully replied to comment ${comment.id}`);
          } else {
            this.logger.error(`Failed to reply to comment ${comment.id}: ${result.message}`);
          }
        } catch (error) {
          this.logger.error(`Error processing comment ${comment.id}`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing comments for post ${postId}`, error);
      throw error;
    }
  }

  async getCommentedPosts(username?: string) {
    return await this.database.getCommentedPosts(username);
  }

  async getPostById(mediaId: string): Promise<InstagramPost> {
    return await this.instagram.getPostById(mediaId);
  }

  async getComments(mediaId: string): Promise<InstagramComment[]> {
    return await this.instagram.getComments(mediaId);
  }

  async getUserByUsername(username: string): Promise<InstagramUser> {
    return await this.instagram.getUserByUsername(username);
  }

  async getRecentPosts(username: string, limit: number): Promise<InstagramPost[]> {
    return await this.instagram.getRecentPosts(username, limit);
  }

  async isCommentReplied(commentId: string): Promise<boolean> {
    return await this.database.isCommentReplied(commentId);
  }

  async replyToComment(mediaId: string, commentId: string, text: string): Promise<InstagramInteractionResult> {
    return await this.instagram.replyToComment(mediaId, commentId, text);
  }

  async addCommentInteraction(commentId: string, postId: string, username: string, replyText: string): Promise<void> {
    await this.database.addCommentInteraction(commentId, postId, username, replyText);
  }

  async getCommentInteractions(postId?: string) {
    return await this.database.getCommentInteractions(postId);
  }

  /**
   * Generates a reply to a comment using the LLM service
   */
  async generateReplyToComment(comment: InstagramComment): Promise<string> {
    const context: ContentContext = {
      type: 'comment',
      content: comment.text,
      metadata: {
        username: comment.username
      }
    };
    return this.llmService.generateReply(context);
  }
} 