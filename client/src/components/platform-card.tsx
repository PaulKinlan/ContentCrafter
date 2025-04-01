import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SocialPost, PlatformConfig } from "@/types/content";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PlatformCardProps {
  post: SocialPost;
  config: PlatformConfig;
}

export default function PlatformCard({ post, config }: PlatformCardProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  
  const characterPercentage = Math.round((post.characterCount / config.maxChars) * 100);
  const isNearLimit = characterPercentage > 85;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setIsCopied(true);
    
    toast({
      title: "Copied!",
      description: `Content for ${config.name} copied to clipboard.`,
      duration: 2000,
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const saveEdit = () => {
    // In a real app, you would want to update this on the server
    // For this demo, we're just updating the local state
    // post.content = editedContent;
    // post.characterCount = editedContent.length;
    
    toast({
      title: "Content Updated",
      description: `Your ${config.name} post has been updated.`,
    });
    
    setIsEditing(false);
  };
  
  return (
    <>
      <Card className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-full flex flex-col">
        <CardHeader className={`px-6 py-3 flex flex-row items-center justify-between ${config.background}`}>
          <h3 className="text-white font-semibold flex items-center">
            {config.icon}
            <span className="ml-2">{config.name}</span>
          </h3>
          <span className="text-white text-sm">{config.maxChars} chars</span>
        </CardHeader>
        
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="mb-4 flex-grow">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-semibold">Your Brand</span>
                  <span className="text-gray-500 mx-1">@yourbrand</span>
                </div>
                <div className="mt-1 text-sm whitespace-pre-line">
                  {post.content}
                </div>
                
                {post.suggestedImage && (
                  <div className="mt-3">
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={post.suggestedImage}
                        alt="Post image" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex justify-between">
              <div className="text-xs text-[#657786]">
                <span className={`font-semibold ${isNearLimit ? 'text-amber-500' : ''}`} style={{ color: isNearLimit ? '' : config.color }}>
                  {post.characterCount}
                </span> / {config.maxChars} characters
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-accent hover:bg-blue-50 p-1 h-auto" 
                title="Edit suggestion"
                onClick={handleEdit}
                style={{ color: config.color }}
              >
                <Pencil size={16} />
              </Button>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <Button 
                className="flex-1 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
                style={{ backgroundColor: config.color }}
                onClick={handleCopy}
              >
                {isCopied ? (
                  <>
                    <Check size={16} className="mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <span className="i-far-copy mr-1"></span> Copy
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-gray-100 text-[#657786] p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Shuffle size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit {config.name} Post</DialogTitle>
            <DialogDescription>
              Make changes to your post content. Character limit is {config.maxChars}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={8}
              className="w-full p-4 border rounded-md"
              maxLength={config.maxChars}
            />
            <div className="text-right mt-2 text-sm text-[#657786]">
              {editedContent.length} / {config.maxChars}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveEdit}
              style={{ backgroundColor: config.color }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
