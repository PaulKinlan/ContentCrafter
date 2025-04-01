import { Twitter, Linkedin, Cloud, MessageCircle } from "lucide-react";
import PlatformCard from "./platform-card";
import { ContentGenerationResponse, PlatformConfig } from "@/types/content";

interface PlatformPostsProps {
  data: ContentGenerationResponse;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  x: {
    name: "X",
    maxChars: 280,
    color: "#1DA1F2",
    background: "bg-[#1DA1F2]",
    icon: <Twitter className="mr-2" size={16} />,
  },
  linkedin: {
    name: "LinkedIn",
    maxChars: 3000,
    color: "#2867B2",
    background: "bg-[#2867B2]",
    icon: <Linkedin className="mr-2" size={16} />,
  },
  bluesky: {
    name: "BlueSky",
    maxChars: 300,
    color: "#0085FF",
    background: "bg-[#0085FF]",
    icon: <Cloud size={16} className="mr-2" />,
  },
  mastodon: {
    name: "Mastodon",
    maxChars: 500,
    color: "#563ACC",
    background: "bg-[#563ACC]",
    icon: <MessageCircle size={16} className="mr-2" />,
  },
};

export default function PlatformPosts({ data }: PlatformPostsProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Platform-Specific Content</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <PlatformCard 
          post={data.posts.x} 
          config={PLATFORM_CONFIGS.x} 
        />
        
        <PlatformCard 
          post={data.posts.linkedin} 
          config={PLATFORM_CONFIGS.linkedin} 
        />
        
        <PlatformCard 
          post={data.posts.bluesky} 
          config={PLATFORM_CONFIGS.bluesky} 
        />
        
        <PlatformCard 
          post={data.posts.mastodon} 
          config={PLATFORM_CONFIGS.mastodon} 
        />
      </div>
    </section>
  );
}
