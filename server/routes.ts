import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeWebpage } from "./scraper";
import { generateSocialPosts } from "./openai";
import { urlAnalysisRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateImageWithReplicate, generatePlatformImagePrompt } from './replicate';
import { Buffer } from 'buffer';

// Declare global imageStreams property for TypeScript
declare global {
  var _imageStreams: Map<string, Uint8Array[]>;
}

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
        content: webpageData.content, // Store the content for expanded view
        tags: webpageData.tags,
        images: webpageData.images
      });

      // Generate social media posts
      const generatedPosts = await generateSocialPosts(webpageData, goal);

      // Process each platform
      for (const platform of ["x", "linkedin", "bluesky", "mastodon"] as const) {
        const post = generatedPosts[platform];
        let imageUrl: string | undefined;
        
        // First, try to use meta image if available (highest priority)
        if (webpageData.images.length > 0) {
          imageUrl = webpageData.images[0]; // Use first meta image
          console.log(`Using meta image for ${platform}: ${imageUrl}`);
        }
        
        // If no meta image or if we specifically want to generate custom images for each platform
        if (!imageUrl || platform !== "x") { // Always generate platform-specific images except for X
          try {
            // Generate an optimized prompt for this platform
            const imagePrompt = generatePlatformImagePrompt(
              webpageData.title, 
              webpageData.description || webpageData.title, 
              platform,
              goal
            );
            
            console.log(`Generating custom image for ${platform}...`);
            
            // Generate image using Replicate API with the platform-specific dimensions
            const generatedImageUrl = await generateImageWithReplicate(imagePrompt, platform);
            if (generatedImageUrl) {
              imageUrl = generatedImageUrl;
              console.log(`Successfully generated custom image for ${platform}: ${imageUrl}`);
            }
          } catch (error) {
            console.error(`Error generating image for ${platform}:`, error);
            // If image generation fails and we have no meta image, we'll have no image for this platform
          }
        }

        // Store the post with the image
        await storage.storeSocialPost({
          webpageContentId: storedWebpageContent.id,
          platform,
          content: post.content,
          characterCount: post.characterCount,
          suggestedImage: imageUrl,
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

  // Endpoint to serve generated images stored in memory
  app.get("/api/image/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!global._imageStreams) {
      return res.status(404).send("Image storage not initialized");
    }
    
    const imageData = global._imageStreams.get(id);
    
    if (!imageData || !imageData.length) {
      return res.status(404).send("Image not found");
    }
    
    try {
      // Combine all chunks into one buffer
      let totalLength = 0;
      for (const chunk of imageData) {
        totalLength += chunk.length;
      }
      
      const buffer = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      
      for (const chunk of imageData) {
        // Copy each chunk into the buffer
        for (let i = 0; i < chunk.length; i++) {
          buffer[offset + i] = chunk[i];
        }
        offset += chunk.length;
      }
      
      // Detect the image format (assuming WebP)
      // Set the content type to image/webp as Replicate generates WebP by default
      res.setHeader('Content-Type', 'image/webp');
      
      // Send the image data
      res.status(200).send(buffer);
      
      console.log(`Successfully served image ${id}`);
    } catch (error) {
      console.error(`Error serving image ${id}:`, error);
      res.status(500).send("Error serving image");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
