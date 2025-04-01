import Replicate from 'replicate';

// Initialize the Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Platform-specific image dimensions
interface ImageDimensions {
  width: number;
  height: number;
}

export const PLATFORM_DIMENSIONS: Record<string, ImageDimensions> = {
  x: { width: 1200, height: 675 },        // 16:9 ratio for Twitter/X
  linkedin: { width: 1200, height: 627 }, // LinkedIn recommended
  bluesky: { width: 1600, height: 900 },  // 16:9 ratio for better quality
  mastodon: { width: 1280, height: 720 }  // 16:9 ratio standard
};

/**
 * Generate an image using the Replicate Flux model
 * @param prompt The text prompt for image generation
 * @param platform The social platform to generate for (determines aspect ratio)
 * @returns The URL of the generated image
 */
export async function generateImageWithReplicate(
  prompt: string,
  platform: string
): Promise<string | undefined> {
  try {
    console.log(`Generating image for ${platform} with Replicate API...`);
    
    // Validate platform
    const validPlatforms = ['x', 'linkedin', 'bluesky', 'mastodon'];
    const validPlatform = validPlatforms.includes(platform) ? platform : 'x';
    
    // Get dimensions for the specified platform
    const dimensions = PLATFORM_DIMENSIONS[validPlatform];
    
    // Check for API key
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN environment variable is not set');
      return undefined;
    }
    
    // Run the model
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro:2acb46daa6ef28dd519a8c9c5e08d51798ca2d075b5df9d5d52f79b8f5a6fd5a",
      {
        input: {
          prompt: prompt,
          width: dimensions.width,
          height: dimensions.height,
          scheduler: "K_EULER_ANCESTRAL",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          negative_prompt: "low quality, blurry, distorted, deformed, disfigured, watermark, text",
          num_outputs: 1,
          aspect_ratio: "custom"
        }
      }
    );
    
    console.log('Replicate API response:', output);
    
    // The model returns an array of image URLs
    if (Array.isArray(output) && output.length > 0) {
      console.log(`Successfully generated image for ${platform}`);
      return output[0] as string;
    }
    
    console.log('Replicate API did not return an image URL');
    return undefined;
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
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
  platform: string
): string {
  const basePrompt = `Create a professional social media image for ${platform} about: ${title}`;
  const contentContext = description ? `. The content is about: ${description.substring(0, 100)}` : '';
  
  const styleGuide: Record<string, string> = {
    x: 'modern and engaging style, vibrant colors, minimal text, professional photography quality',
    linkedin: 'corporate and professional style, business-appropriate, clean layout, trustworthy appearance',
    bluesky: 'friendly and minimalist style, soft colors, clean design, approachable look',
    mastodon: 'community-focused and authentic style, warm colors, inclusive imagery'
  };
  
  // Validate platform and use its style or default to x style
  const validPlatforms = ['x', 'linkedin', 'bluesky', 'mastodon'];
  const validPlatform = validPlatforms.includes(platform) ? platform : 'x';
  const style = styleGuide[validPlatform];
  
  return `${basePrompt}${contentContext}. ${style}. High resolution, no text overlay.`;
}