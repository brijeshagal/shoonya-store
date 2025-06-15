export interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
  permissions: string;
}

export interface InstagramLongLivedToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface InstagramBusinessAccount {
  id: string;
  name: string;
  category: string;
  access_token: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  username: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  user_id: string;
}

export interface InstagramDirectMessage {
  id: string;
  message: string;
  timestamp: string;
  from: {
    id: string;
    username: string;
  };
  to: {
    id: string;
    username: string;
  };
}

export interface InstagramThread {
  id: string;
  participants: Array<{
    id: string;
    username: string;
  }>;
  last_message: InstagramDirectMessage;
  unread_count: number;
} 