export interface InstagramPost {
  id: string;
  caption?: string;
  takenAt: Date;
  likeCount: number;
  commentCount: number;
  mediaType: number;
  user: {
    id: string;
    username: string;
    fullName: string;
  };
  rawData?: any;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  createdAt: Date;
}

export interface InstagramUser {
  id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
}

export interface InstagramInteractionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

export interface InstagramService {
  getPostById(mediaId: string): Promise<InstagramPost>;
  getComments(mediaId: string): Promise<InstagramComment[]>;
  postComment(mediaId: string, text: string): Promise<InstagramInteractionResult>;
  replyToComment(mediaId: string, commentId: string, text: string): Promise<InstagramInteractionResult>;
  likePost(mediaId: string): Promise<InstagramInteractionResult>;
  getUserByUsername(username: string): Promise<InstagramUser>;
  getRecentPosts(username: string, limit: number): Promise<InstagramPost[]>;
} 