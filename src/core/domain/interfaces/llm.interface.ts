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

export interface SocialContext {
  platform: string;
  contentType: 'post' | 'comment' | 'message' | 'tweet';
  contentId?: string;
  author?: {
    id?: string;
    username?: string;
    displayName?: string;
  };
  media?: MediaContent[];
  text?: string;
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
  generateContent(context: SocialContext, type: 'comment' | 'reply' | 'caption' | 'message'): Promise<LLMResponse>;
  analyzeMedia(media: MediaContent): Promise<LLMResponse>;
  generateSummary(context: SocialContext): Promise<LLMResponse>;
  generateEngagement(context: SocialContext): Promise<LLMResponse>;
} 