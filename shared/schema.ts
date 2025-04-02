import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base schemas for the different platforms
export const platformSchema = z.enum(["x", "linkedin", "bluesky", "mastodon"]);
export type Platform = z.infer<typeof platformSchema>;

export const goalSchema = z.enum(["none", "engagement", "awareness", "traffic", "conversion", "authority"]);
export type Goal = z.infer<typeof goalSchema>;

// Schema for extracted webpage content
export const webpageContent = pgTable("webpage_contents", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  domain: text("domain"),
  content: text("content"),  // Full content that gets passed to the LLM
  tags: text("tags").array(),
  images: text("images").array(),
});

export const insertWebpageContentSchema = createInsertSchema(webpageContent).pick({
  url: true,
  title: true,
  description: true,
  domain: true,
  content: true,
  tags: true,
  images: true,
});

// Schema for generated social posts
export const socialPost = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  webpageContentId: integer("webpage_content_id").notNull().references(() => webpageContent.id),
  platform: text("platform", { enum: ["x", "linkedin", "bluesky", "mastodon"] }).notNull(),
  content: text("content").notNull(),
  characterCount: integer("character_count").notNull(),
  suggestedImage: text("suggested_image"),
  goal: text("goal", { enum: ["none", "engagement", "awareness", "traffic", "conversion", "authority"] }),
});

export const insertSocialPostSchema = createInsertSchema(socialPost).pick({
  webpageContentId: true,
  platform: true,
  content: true,
  characterCount: true,
  suggestedImage: true,
  goal: true,
});

// Create request schema for URL analysis
export const urlAnalysisRequestSchema = z.object({
  url: z.string().url(),
  goal: z.string().transform(val => val === "" ? "none" : val).pipe(goalSchema),
});

// Type definitions
export type InsertWebpageContent = z.infer<typeof insertWebpageContentSchema>;
export type WebpageContent = typeof webpageContent.$inferSelect;

export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialPost = typeof socialPost.$inferSelect;

export type UrlAnalysisRequest = z.infer<typeof urlAnalysisRequestSchema>;

// Response type for API
export type ContentGenerationResponse = {
  sourceContent: WebpageContent;
  posts: {
    x: SocialPost;
    linkedin: SocialPost;
    bluesky: SocialPost;
    mastodon: SocialPost;
  };
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
