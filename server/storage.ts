import { WebpageContent, InsertWebpageContent, SocialPost, InsertSocialPost, ContentGenerationResponse, Platform } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Webpage content methods
  storeWebpageContent(content: InsertWebpageContent): Promise<WebpageContent>;
  getWebpageContentByUrl(url: string): Promise<WebpageContent | undefined>;
  
  // Social post methods
  storeSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  getSocialPostsByWebpageId(webpageContentId: number): Promise<SocialPost[]>;
  getSocialPostsByPlatform(webpageContentId: number, platform: Platform): Promise<SocialPost | undefined>;
  
  // Combined retrieval for full content generation response
  getGenerationResults(webpageContentId: number): Promise<ContentGenerationResponse | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private webpageContents: Map<number, WebpageContent>;
  private socialPosts: Map<number, SocialPost>;
  private userCurrentId: number;
  private webpageCurrentId: number;
  private socialPostCurrentId: number;

  constructor() {
    this.users = new Map();
    this.webpageContents = new Map();
    this.socialPosts = new Map();
    this.userCurrentId = 1;
    this.webpageCurrentId = 1;
    this.socialPostCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Webpage content methods
  async storeWebpageContent(content: InsertWebpageContent): Promise<WebpageContent> {
    // Check if content with this URL already exists
    const existingContent = await this.getWebpageContentByUrl(content.url);
    if (existingContent) {
      return existingContent;
    }

    const id = this.webpageCurrentId++;
    const webpageContent: WebpageContent = { ...content, id };
    this.webpageContents.set(id, webpageContent);
    return webpageContent;
  }

  async getWebpageContentByUrl(url: string): Promise<WebpageContent | undefined> {
    return Array.from(this.webpageContents.values()).find(
      (content) => content.url === url,
    );
  }

  // Social post methods
  async storeSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const id = this.socialPostCurrentId++;
    const socialPost: SocialPost = { ...post, id };
    this.socialPosts.set(id, socialPost);
    return socialPost;
  }

  async getSocialPostsByWebpageId(webpageContentId: number): Promise<SocialPost[]> {
    return Array.from(this.socialPosts.values()).filter(
      (post) => post.webpageContentId === webpageContentId,
    );
  }

  async getSocialPostsByPlatform(webpageContentId: number, platform: Platform): Promise<SocialPost | undefined> {
    return Array.from(this.socialPosts.values()).find(
      (post) => post.webpageContentId === webpageContentId && post.platform === platform,
    );
  }

  // Combined retrieval for full content generation response
  async getGenerationResults(webpageContentId: number): Promise<ContentGenerationResponse | undefined> {
    const sourceContent = Array.from(this.webpageContents.values()).find(
      (content) => content.id === webpageContentId,
    );

    if (!sourceContent) {
      return undefined;
    }

    const posts = await this.getSocialPostsByWebpageId(webpageContentId);
    
    if (posts.length < 4) {
      return undefined;
    }

    const xPost = posts.find(post => post.platform === 'x');
    const linkedinPost = posts.find(post => post.platform === 'linkedin');
    const blueskyPost = posts.find(post => post.platform === 'bluesky');
    const mastodonPost = posts.find(post => post.platform === 'mastodon');

    if (!xPost || !linkedinPost || !blueskyPost || !mastodonPost) {
      return undefined;
    }

    return {
      sourceContent,
      posts: {
        x: xPost,
        linkedin: linkedinPost,
        bluesky: blueskyPost,
        mastodon: mastodonPost,
      },
    };
  }
}

export const storage = new MemStorage();
