import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo_key" });

// Function to generate image using DALL-E
export async function generateImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    return undefined;
  }
}

type Platform = "x" | "linkedin" | "bluesky" | "mastodon";

interface PlatformConfig {
  name: string;
  maxChars: number;
  style: string;
}

const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  x: {
    name: "X (Twitter)",
    maxChars: 280,
    style: "Concise, engaging, uses hashtags sparingly. Include relevant emojis. Good for quick updates and links.",
  },
  linkedin: {
    name: "LinkedIn",
    maxChars: 3000,
    style: "Professional, detailed, structured with bullet points. Uses industry terminology and focuses on business value. Include relevant hashtags.",
  },
  bluesky: {
    name: "BlueSky",
    maxChars: 300,
    style: "Conversational and personal. Similar to X but can be more casual. Uses fewer hashtags and more natural language.",
  },
  mastodon: {
    name: "Mastodon",
    maxChars: 500,
    style: "Community-focused, transparent. Uses hashtags meaningfully. Avoids marketing speak and prefers authentic voice.",
  },
};

export interface WebpageData {
  url: string;
  title: string;
  description: string;
  domain: string;
  content: string;
  tags: string[];
  images: string[];
}

export interface GeneratedPost {
  platform: Platform;
  content: string;
  characterCount: number;
  suggestedImage?: string;
}

export async function generateSocialPosts(
  webpageData: WebpageData,
  goal?: string
): Promise<Record<Platform, GeneratedPost>> {
  const goalContext = goal && goal !== "none"
    ? `The content should focus on the goal of "${goal}" - prioritize content that helps achieve this goal.`
    : "The content should be balanced for general engagement and information sharing.";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional social media strategist. You create platform-specific social media posts based on webpage content.
            
            You'll receive information about a webpage and you need to create optimized posts for X, LinkedIn, BlueSky, and Mastodon.
            Each platform has different character limits and styles that must be respected.
            
            ${goalContext}
            
            For each platform, generate content that:
            1. Is within the character limit
            2. Matches the platform's style and audience expectations
            3. Highlights the most relevant information from the article
            4. Includes appropriate formatting (line breaks, emojis, hashtags)
            5. Always includes the URL to the original content
            
            Important: Always create actual content for each platform. Never return empty or generic placeholder content.
            Make sure to analyze the webpage content thoroughly and extract meaningful information.
            
            Return the results as a JSON object with these keys:
            - x: the post content for X (formerly Twitter)
            - linkedin: the post content for LinkedIn
            - bluesky: the post content for BlueSky
            - mastodon: the post content for Mastodon
            - x_image: (optional) image suggestion for X
            - linkedin_image: (optional) image suggestion for LinkedIn
            - bluesky_image: (optional) image suggestion for BlueSky
            - mastodon_image: (optional) image suggestion for Mastodon`,
        },
        {
          role: "user",
          content: `Generate social media posts for this webpage:
            
            URL: ${webpageData.url}
            Title: ${webpageData.title}
            Description: ${webpageData.description}
            Content: ${webpageData.content.substring(0, 2000)}
            Tags: ${webpageData.tags.join(", ")}
            
            For each platform, create ENGAGING and INFORMATIVE content:
            
            1. X (Twitter):
               - Character limit: ${PLATFORM_CONFIGS.x.maxChars}
               - Style: ${PLATFORM_CONFIGS.x.style}
               - Be concise but impactful
               - Use relevant hashtags (2-3 max)
               - Include emojis where appropriate
               - MUST include the URL: ${webpageData.url}
            
            2. LinkedIn:
               - Character limit: ${PLATFORM_CONFIGS.linkedin.maxChars}
               - Style: ${PLATFORM_CONFIGS.linkedin.style}
               - More detailed and professional
               - Include bullet points for key takeaways
               - Use 1-2 professional hashtags
               - MUST include the URL: ${webpageData.url}
            
            3. BlueSky:
               - Character limit: ${PLATFORM_CONFIGS.bluesky.maxChars}
               - Style: ${PLATFORM_CONFIGS.bluesky.style}
               - Conversational and personal tone
               - Can include creative elements
               - MUST include the URL: ${webpageData.url}
            
            4. Mastodon:
               - Character limit: ${PLATFORM_CONFIGS.mastodon.maxChars}
               - Style: ${PLATFORM_CONFIGS.mastodon.style}
               - Community-focused
               - Use meaningful hashtags
               - Transparent and authentic
               - MUST include the URL: ${webpageData.url}
            
            If there are images available, suggest which one might work best for each platform:
            Available images: ${webpageData.images.join(", ")}
            
            Remember to analyze the content thoroughly and extract the most important points for each platform.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure proper formatting and character counts
    const platformResults: Record<Platform, GeneratedPost> = {
      x: {
        platform: "x",
        content: content.x || "No content generated for X",
        characterCount: (content.x || "").length,
        suggestedImage: content.x_image || webpageData.images[0] || undefined,
      },
      linkedin: {
        platform: "linkedin",
        content: content.linkedin || "No content generated for LinkedIn",
        characterCount: (content.linkedin || "").length,
        suggestedImage: content.linkedin_image || webpageData.images[0] || undefined,
      },
      bluesky: {
        platform: "bluesky",
        content: content.bluesky || "No content generated for BlueSky",
        characterCount: (content.bluesky || "").length,
        suggestedImage: content.bluesky_image || webpageData.images[0] || undefined,
      },
      mastodon: {
        platform: "mastodon",
        content: content.mastodon || "No content generated for Mastodon",
        characterCount: (content.mastodon || "").length,
        suggestedImage: content.mastodon_image || webpageData.images[0] || undefined,
      },
    };

    return platformResults;
  } catch (error) {
    console.error("Error generating social media posts:", error);
    throw new Error("Failed to generate social media posts");
  }
}
