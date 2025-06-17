export interface MediaContent {
  type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  metadata?: {
    url?: string;
    mimeType?: string;
    size?: number;
    duration?: number;
    dimensions?: {
      width?: number;
      height?: number;
    };
  };
}

export interface ContentContext {
  type: 'post' | 'comment' | 'message';
  content: string;
  media?: MediaContent[];
  metadata?: Record<string, any>;
}

export interface LLMResponse {
  content: string;
  metadata?: {
    confidence?: number;
    tokens?: number;
    model?: string;
    processingTime?: number;
    cost?: number;
  };
}

export interface LLMService {
  /**
   * Analyzes media content and returns a description
   */
  analyzeMedia(media: MediaContent): Promise<LLMResponse>;

  /**
   * Generates a comment based on the content context
   */
  generateComment(context: ContentContext): Promise<LLMResponse>;

  /**
   * Generates a reply to a comment
   */
  generateReply(context: ContentContext): Promise<LLMResponse>;

  /**
   * Generates a caption for media content
   */
  generateCaption(context: ContentContext): Promise<LLMResponse>;

  /**
   * Generates a summary of the content
   */
  generateSummary(context: ContentContext): Promise<LLMResponse>;
} 