export interface CommentedPost {
  postId: string;
  username: string;
  commentedAt: Date;
  commentText: string;
}

export interface CommentInteraction {
  commentId: string;
  postId: string;
  username: string;
  repliedAt: Date;
  replyText: string;
}

export interface DatabaseService {
  initialize(): Promise<void>;
  isPostCommented(postId: string): Promise<boolean>;
  addCommentedPost(postId: string, username: string, commentText: string): Promise<void>;
  getCommentedPosts(username?: string): Promise<CommentedPost[]>;
  isCommentReplied(commentId: string): Promise<boolean>;
  addCommentInteraction(commentId: string, postId: string, username: string, replyText: string): Promise<void>;
  getCommentInteractions(postId?: string): Promise<CommentInteraction[]>;
} 