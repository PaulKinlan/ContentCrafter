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

    console.log("Replicate API response type:", typeof output, output instanceof ReadableStream ? "ReadableStream" : "Not ReadableStream");

    // Check if we received a ReadableStream
    if (output instanceof ReadableStream) {
      console.log(`Processing ReadableStream for ${platform}...`);
      
      // Create a reader for the stream
      const reader = output.getReader();
      let resultText = '';
      
      // Read all chunks from the stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Convert the chunk to a string (assuming UTF-8 encoding)
          if (value) {
            const chunk = new TextDecoder().decode(value);
            resultText += chunk;
            console.log(`Read chunk: ${chunk.substring(0, 50)}...`);
          }
        }
        
        console.log(`Complete stream result for ${platform}:`, resultText.substring(0, 200));
        
        // Try to parse the final line as JSON (the completed result)
        try {
          // Sometimes the stream returns multiple JSON objects, get the last complete one
          const lines = resultText.trim().split('\n');
          const lastLine = lines[lines.length - 1].trim();
          
          if (lastLine) {
            const jsonResult = JSON.parse(lastLine);
            
            if (Array.isArray(jsonResult) && jsonResult.length > 0) {
              console.log(`Successfully parsed stream for ${platform}: ${jsonResult[0]}`);
              return jsonResult[0];
            } else if (typeof jsonResult === 'string') {
              console.log(`Successfully parsed stream for ${platform}: ${jsonResult}`);
              return jsonResult;
            }
          }
        } catch (parseError) {
          console.error(`Error parsing JSON from stream for ${platform}:`, parseError);
        }
      } catch (streamError) {
        console.error(`Error reading stream for ${platform}:`, streamError);
      }
    }
    // If it's not a stream but directly an array/string (fallback for backward compatibility)
    else if (Array.isArray(output) && output.length > 0) {
      console.log(`Successfully received array output for ${platform}: ${output[0]}`);
      return output[0] as string;
    } else if (typeof output === 'string') {
      console.log(`Successfully received string output for ${platform}: ${output}`);
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
): string {
  const basePrompt = `Create a professional social media image for ${platform} about: ${title}`;
  const contentContext = description
    ? `. The content is about: ${description.substring(0, 100)}`
    : "";

  const styleGuide: Record<string, string> = {
    x: "modern and engaging style, vibrant colors, minimal text, professional photography quality",
    linkedin:
      "corporate and professional style, business-appropriate, clean layout, trustworthy appearance",
    bluesky:
      "friendly and minimalist style, soft colors, clean design, approachable look",
    mastodon:
      "community-focused and authentic style, warm colors, inclusive imagery",
  };

  // Validate platform and use its style or default to x style
  const validPlatforms = ["x", "linkedin", "bluesky", "mastodon"];
  const validPlatform = validPlatforms.includes(platform) ? platform : "x";
  const style = styleGuide[validPlatform];

  return `${basePrompt}${contentContext}. ${style}. High resolution, no text overlay.`;
}
