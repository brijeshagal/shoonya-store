export interface CommentedPost {
  postId: string;
  username: string;
  commentedAt: Date;
  commentText: string;
}

export interface DatabaseService {
  initialize(): Promise<void>;
  isPostCommented(postId: string): Promise<boolean>;
  addCommentedPost(postId: string, username: string, commentText: string): Promise<void>;
  getCommentedPosts(username?: string): Promise<CommentedPost[]>;
} 