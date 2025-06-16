import { IgApiClient } from 'instagram-private-api';
import { InstagramService, InstagramPost, InstagramUser, InstagramComment, InstagramInteractionResult } from '../../core/domain/interfaces/instagram.interface';
import { Logger } from '../../scripts/logging/logger';

export class InstagramApiClient implements InstagramService {
  private ig: IgApiClient;
  private readonly logger: Logger;

  constructor() {
    this.ig = new IgApiClient();
    this.logger = new Logger('InstagramClient');
  }

  async initialize(username: string, password: string): Promise<void> {
    try {
      this.ig.state.generateDevice(username);
      await this.ig.account.login(username, password);
      this.logger.info('Instagram client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Instagram client', { error });
      throw error;
    }
  }

  async getPostById(mediaId: string): Promise<InstagramPost> {
    try {
      const mediaInfo = await this.ig.media.info(mediaId);
      const post = mediaInfo.items[0];

      return {
        id: post.id,
        caption: post.caption?.text,
        takenAt: new Date(post.taken_at * 1000),
        likeCount: post.like_count,
        commentCount: post.comment_count,
        mediaType: post.media_type,
        user: {
          id: post.user.pk.toString(),
          username: post.user.username,
          fullName: post.user.full_name
        },
        rawData: post
      };
    } catch (error) {
      this.logger.error(`Failed to get post ${mediaId}`, { error });
      throw error;
    }
  }

  async getComments(mediaId: string): Promise<InstagramComment[]> {
    try {
      const feed = this.ig.feed.mediaComments(mediaId);
      const comments = await feed.items();
      return comments.map(comment => ({
        id: comment.pk.toString(),
        text: comment.text,
        username: comment.user.username,
        createdAt: new Date(comment.created_at * 1000)
      }));
    } catch (error) {
      this.logger.error(`Failed to get comments for post ${mediaId}`, { error });
      throw error;
    }
  }

  async postComment(mediaId: string, text: string): Promise<InstagramInteractionResult> {
    try {
      await this.ig.media.comment({
        mediaId,
        text
      });

      return {
        success: true,
        message: 'Comment posted successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to comment on post ${mediaId}`, { error });
      return {
        success: false,
        message: 'Failed to post comment',
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  async likePost(mediaId: string): Promise<InstagramInteractionResult> {
    try {
      await this.ig.media.like({
        mediaId,
        d: 1,
        moduleInfo: {
          module_name: 'profile',
          user_id: this.ig.state.cookieUserId,
          username: this.ig.state.cookieUsername || ''
        }
      });

      return {
        success: true,
        message: 'Post liked successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to like post ${mediaId}`, { error });
      return {
        success: false,
        message: 'Failed to like post',
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  async getUserByUsername(username: string): Promise<InstagramUser> {
    try {
      const userInfo = await this.ig.user.searchExact(username);
      return {
        id: userInfo.pk.toString(),
        username: userInfo.username,
        fullName: userInfo.full_name
      };
    } catch (error) {
      this.logger.error(`Failed to get user ${username}`, { error });
      throw error;
    }
  }

  async getRecentPosts(username: string, limit: number): Promise<InstagramPost[]> {
    try {
      const user = await this.getUserByUsername(username);
      const userFeed = this.ig.feed.user(user.id);
      const posts = await userFeed.items();

      return posts.slice(0, limit).map(post => ({
        id: post.id,
        caption: post.caption?.text,
        takenAt: new Date(post.taken_at * 1000),
        likeCount: post.like_count,
        commentCount: post.comment_count,
        mediaType: post.media_type,
        user: {
          id: post.user.pk.toString(),
          username: post.user.username,
          fullName: post.user.full_name
        },
        rawData: post
      }));
    } catch (error) {
      this.logger.error(`Failed to get posts for user ${username}`, { error });
      throw error;
    }
  }

  async replyToComment(mediaId: string, commentId: string, text: string): Promise<InstagramInteractionResult> {
    try {
      await this.ig.media.comment({
        mediaId,
        text,
        replyToCommentId: commentId
      });

      return {
        success: true,
        message: 'Reply posted successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to reply to comment ${commentId} on post ${mediaId}`, { error });
      return {
        success: false,
        message: 'Failed to post reply',
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
} 