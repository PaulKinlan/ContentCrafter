export interface SourceContent {
  id: number;
  url: string;
  title: string;
  description?: string;
  domain?: string;
  content?: string;  // Full content that gets passed to the LLM
  tags: string[];
  images: string[];
}

export type PlatformType = 'x' | 'linkedin' | 'bluesky' | 'mastodon';

export interface SocialPost {
  id: number;
  webpageContentId: number;
  platform: PlatformType;
  content: string;
  characterCount: number;
  suggestedImage?: string;
  goal?: string;
}

export interface ContentGenerationResponse {
  sourceContent: SourceContent;
  posts: {
    x: SocialPost;
    linkedin: SocialPost;
    bluesky: SocialPost;
    mastodon: SocialPost;
  };
}

export interface UrlFormData {
  url: string;
  goal?: string;
}

export interface PlatformConfig {
  name: string;
  maxChars: number;
  color: string;
  icon: React.ReactNode;
  background: string;
}
