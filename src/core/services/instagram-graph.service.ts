import axios from 'axios';
import { InstagramComment, InstagramInteractionResult, InstagramPost, InstagramService, InstagramUser } from '../domain/interfaces/instagram.interface';
import { Logger } from '../../scripts/logging/logger';

export class InstagramGraphService implements InstagramService {
  private readonly logger: Logger;
  private readonly graphUrl: string;
  private readonly accessToken: string;
  private readonly userId: string;

  constructor() {
    this.logger = new Logger('InstagramGraphService');
    this.graphUrl = 'https://graph.facebook.com/v23.0';
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    this.userId = process.env.INSTAGRAM_USER_ID || '';

    if (!this.accessToken || !this.userId) {
      throw new Error('Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID in environment variables');
    }
  }

  async getRecentPosts(username: string, limit: number): Promise<InstagramPost[]> {
    try {
      const url = `${this.graphUrl}/${this.userId}/media`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          limit,
          fields: 'caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count'
        }
      });

      return response.data.data.map((post: any) => ({
        id: post.id,
        caption: post.caption || '',
        mediaType: post.media_type === 'VIDEO' ? 2 : 1,
        takenAt: new Date(post.timestamp),
        likeCount: post.like_count || 0,
        commentCount: post.comments_count || 0,
        user: {
          id: this.userId,
          username: post.username || post.owner?.username || username,
          fullName: post.username || post.owner?.username || username
        },
        rawData: post
      }));
    } catch (error) {
      this.logger.error('Error fetching recent posts', error);
      throw error;
    }
  }

  async getComments(mediaId: string): Promise<InstagramComment[]> {
    try {
      const url = `${this.graphUrl}/${mediaId}/comments`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          fields: 'id,text,username,timestamp'
        }
      });

      return response.data.data.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        username: comment.username,
        timestamp: new Date(comment.timestamp)
      }));
    } catch (error) {
      this.logger.error('Error fetching comments', error);
      throw error;
    }
  }

  async postComment(mediaId: string, text: string): Promise<InstagramInteractionResult> {
    try {
      const url = `${this.graphUrl}/${mediaId}/comments`;
      const response = await axios.post(url, {
        message: text,
        access_token: this.accessToken
      });

      return {
        success: true,
        message: 'Comment posted successfully',
        data: response.data
      };
    } catch (error) {
      this.logger.error('Error posting comment', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async replyToComment(mediaId: string, commentId: string, text: string): Promise<InstagramInteractionResult> {
    try {
      const url = `${this.graphUrl}/${commentId}/replies`;
      const response = await axios.post(url, {
        message: text,
        access_token: this.accessToken
      });

      return {
        success: true,
        message: 'Reply posted successfully',
        data: response.data
      };
    } catch (error) {
      this.logger.error('Error posting reply', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getPostById(mediaId: string): Promise<InstagramPost> {
    try {
      const url = `${this.graphUrl}/${mediaId}`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count'
        }
      });

      const post = response.data;
      return {
        id: post.id,
        caption: post.caption || '',
        mediaType: post.media_type === 'VIDEO' ? 2 : 1,
        takenAt: new Date(post.timestamp),
        likeCount: post.like_count || 0,
        commentCount: post.comments_count || 0,
        user: {
          id: this.userId,
          username: post.owner?.username || this.userId,
          fullName: post.owner?.username || this.userId
        },
        rawData: post
      };
    } catch (error) {
      this.logger.error('Error fetching post by ID', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<InstagramUser> {
    try {
      const url = `${this.graphUrl}/${this.userId}`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          fields: 'id,username,profile_picture_url,followers_count,follows_count,media_count'
        }
      });

      const user = response.data;
      return {
        id: user.id,
        username: user.username,
        fullName: user.username,
        profilePicture: user.profile_picture_url
      };
    } catch (error) {
      this.logger.error('Error fetching user by username', error);
      throw error;
    }
  }

  async likePost(mediaId: string): Promise<InstagramInteractionResult> {
    try {
      const url = `${this.graphUrl}/${mediaId}/likes`;
      const response = await axios.post(url, {
        access_token: this.accessToken
      });

      return {
        success: true,
        message: 'Post liked successfully',
        data: response.data
      };
    } catch (error) {
      this.logger.error('Error liking post', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 