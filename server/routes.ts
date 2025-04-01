import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeWebpage } from "./scraper";
import { generateSocialPosts } from "./openai";
import { urlAnalysisRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to analyze a URL and generate social media content
  app.post("/api/analyze-url", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = urlAnalysisRequestSchema.parse(req.body);
      const { url, goal } = validatedData;

      // Scrape the webpage to get content
      const webpageData = await scrapeWebpage(url);

      // Store the webpage content
      const storedWebpageContent = await storage.storeWebpageContent({
        url: webpageData.url,
        title: webpageData.title,
        description: webpageData.description,
        domain: webpageData.domain,
        tags: webpageData.tags,
        images: webpageData.images
      });

      // Generate social media posts
      const generatedPosts = await generateSocialPosts(webpageData, goal);

      // Store each platform post
      for (const platform of ["x", "linkedin", "bluesky", "mastodon"] as const) {
        const post = generatedPosts[platform];
        await storage.storeSocialPost({
          webpageContentId: storedWebpageContent.id,
          platform,
          content: post.content,
          characterCount: post.characterCount,
          suggestedImage: post.suggestedImage,
          goal: goal
        });
      }

      // Get the complete generation results
      const results = await storage.getGenerationResults(storedWebpageContent.id);

      if (!results) {
        return res.status(500).json({ message: "Failed to retrieve generated content" });
      }

      res.status(200).json(results);
    } catch (error) {
      console.error("Error processing URL:", error);
      
      if (error instanceof ZodError) {
        // Handle validation errors
        const validationError = fromZodError(error);
        return res.status(400).json({
          message: "Validation error",
          details: validationError.message
        });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      res.status(500).json({ message: "An unknown error occurred" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
