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

    // Create a prediction
    const prediction = await replicate.predictions.create({
      version: "471dee8e6c1bda0de704e854a9bee7a6b6bc172cc496ccad0d54be1b2bb114ac", // flux-1.1-pro model version
      input: {
        prompt: prompt,
        width: dimensions.width,
        height: dimensions.height,
        output_format: "webp",
        output_quality: 80,
        safety_tolerance: 2,
        prompt_upsampling: true,
        aspect_ratio: "custom",
      }
    });

    // Poll for prediction status
    let result = prediction;
    while (
      result.status !== "succeeded" &&
      result.status !== "failed" &&
      result.status !== "canceled"
    ) {
      console.log(`Waiting for image generation (status: ${result.status})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      // Get the prediction status
      result = await replicate.predictions.get(prediction.id);
    }

    // Check if the prediction succeeded
    if (result.status === "succeeded" && result.output) {
      // The output can either be an array of URLs or a single URL
      if (Array.isArray(result.output) && result.output.length > 0) {
        console.log(`Successfully generated image for ${platform}: ${result.output[0]}`);
        return result.output[0];
      } else if (typeof result.output === 'string') {
        console.log(`Successfully generated image for ${platform}: ${result.output}`);
        return result.output;
      }
    }

    console.log(`Image generation for ${platform} did not succeed. Status: ${result.status}`);
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
