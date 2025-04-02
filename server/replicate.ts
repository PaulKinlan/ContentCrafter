import Replicate from "replicate";

// Initialize the Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Platform-specific image dimensions
interface ImageDimensions {
  width: number;
  height: number;
}

export const PLATFORM_DIMENSIONS: Record<string, ImageDimensions> = {
  x: { width: 1200, height: 675 }, // 16:9 ratio for Twitter/X
  linkedin: { width: 1200, height: 627 }, // LinkedIn recommended
  bluesky: { width: 1200, height: 627 }, // 16:9 ratio for better quality
  mastodon: { width: 1280, height: 720 }, // 16:9 ratio standard
};

/**
 * Generate an image using the Replicate Flux model
 * @param prompt The text prompt for image generation
 * @param platform The social platform to generate for (determines aspect ratio)
 * @returns The URL of the generated image
 */
export async function generateImageWithReplicate(
  prompt: string,
  platform: string,
): Promise<string | undefined> {
  try {
    console.log(`Generating image for ${platform} with Replicate API...`);

    // Validate platform
    const validPlatforms = ["x", "linkedin", "bluesky", "mastodon"];
    const validPlatform = validPlatforms.includes(platform) ? platform : "x";

    // Get dimensions for the specified platform
    const dimensions = PLATFORM_DIMENSIONS[validPlatform];

    // Check for API key
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN environment variable is not set");
      return undefined;
    }

    // Run the model - this returns a ReadableStream
    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt: prompt,
        width: dimensions.width,
        height: dimensions.height,
        output_format: "webp",
        output_quality: 80,
        safety_tolerance: 2,
        prompt_upsampling: true,
        aspect_ratio: "custom",
      },
    });

    console.log(
      "Replicate API response type:",
      typeof output,
      output instanceof ReadableStream
        ? "ReadableStream"
        : "Not ReadableStream",
    );

    // Check if we received a ReadableStream
    if (output instanceof ReadableStream) {
      console.log(`Processing ReadableStream for ${platform}...`);

      // The model is returning the binary image data directly in the stream
      // We need to create a custom endpoint to serve this image

      // Generate a unique image ID for this generation
      const imageId = `${platform}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      console.log(`Generated image ID for ${platform}: ${imageId}`);

      // Store this stream reference for serving later
      // We'll add a route in server/routes.ts to serve this image
      if (!global._imageStreams) {
        global._imageStreams = new Map<string, Uint8Array[]>();
      }

      // We can't directly store the stream, so let's collect all chunks first
      try {
        const reader = output.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
          }
        }

        // Store the chunks for serving
        global._imageStreams.set(imageId, chunks);
        console.log(
          `Stored image data for ${imageId}, ${chunks.length} chunks`,
        );

        // Return a URL to our custom endpoint
        const imageUrl = `/api/image/${imageId}`;
        console.log(`Generated local image URL for ${platform}: ${imageUrl}`);
        return imageUrl;
      } catch (streamError) {
        console.error(`Error reading stream for ${platform}:`, streamError);
      }
    }
    // If it's not a stream but directly an array/string (fallback for backward compatibility)
    else if (Array.isArray(output) && output.length > 0) {
      console.log(
        `Successfully received array output for ${platform}: ${output[0]}`,
      );
      return output[0] as string;
    } else if (typeof output === "string") {
      console.log(
        `Successfully received string output for ${platform}: ${output}`,
      );
      return output;
    }

    console.log(`Could not extract image URL for ${platform}`);
    return undefined;
  } catch (error) {
    console.error("Error generating image with Replicate:", error);
    return undefined;
  }
}

/**
 * Generate a platform-specific image prompt
 * @param title Webpage title
 * @param description Webpage description
 * @param platform Social platform
 * @returns A prompt string optimized for the platform
 */
export function generatePlatformImagePrompt(
  title: string,
  description: string,
  platform: string,
  goal?: string
): string {
  let basePrompt = `Create a professional social media image for ${platform} about: ${title}`;
  const contentContext = description
    ? `. The content is about: ${description.substring(0, 100)}`
    : "";

  // Base style guides for platforms
  const baseStyleGuide: Record<string, string> = {
    x: "modern and engaging style, vibrant colors, minimal text, professional photography quality",
    linkedin:
      "corporate and professional style, business-appropriate, clean layout, trustworthy appearance",
    bluesky:
      "friendly and minimalist style, soft colors, clean design, approachable look",
    mastodon:
      "community-focused and authentic style, warm colors, inclusive imagery",
  };
  
  // Goal-specific visual approaches
  const goalVisualGuide: Record<string, string> = {
    engagement: "eye-catching and emotionally resonant, with vibrant colors that stand out in a feed, designed to stop scrolling",
    awareness: "brand-focused with clear visual elements that reinforce brand identity, memorable and distinctive visuals",
    traffic: "visually indicates there's more to discover, creates curiosity with partial information or teaser elements",
    conversion: "clear value proposition visual, shows benefits or results, includes subtle urgency cues",
    authority: "data-driven visuals, professional and authoritative imagery, expert-level presentation with charts or visual structure"
  };
  
  // Add goal-specific prompt elements if a goal is provided and valid
  let goalPrompt = "";
  if (goal && goal !== "none" && goalVisualGuide[goal]) {
    goalPrompt = `. Optimize for ${goal} goal with ${goalVisualGuide[goal]}`;
    // Adjust the base prompt to include the goal
    basePrompt = `Create a ${goal}-focused social media image for ${platform} about: ${title}`;
  }
  
  const styleGuide = baseStyleGuide;

  // Validate platform and use its style or default to x style
  const validPlatforms = ["x", "linkedin", "bluesky", "mastodon"];
  const validPlatform = validPlatforms.includes(platform) ? platform : "x";
  const style = styleGuide[validPlatform];

  return `${basePrompt}${contentContext}. ${style}${goalPrompt}. High resolution, no text overlay.`;
}
