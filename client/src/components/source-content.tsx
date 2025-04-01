import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceContent } from "@/types/content";

interface SourceContentProps {
  content: SourceContent;
}

export default function SourceContentPreview({ content }: SourceContentProps) {
  return (
    <Card className="bg-white rounded-xl shadow-md mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Source Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded overflow-hidden">
            {content.images && content.images.length > 0 ? (
              <img 
                src={content.images[0]} 
                alt="Article thumbnail" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                No image
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">{content.title}</h3>
            <p className="text-sm text-[#657786] mb-2">{content.domain}</p>
            <p className="text-sm line-clamp-2">{content.description}</p>
            
            {content.tags && content.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block bg-[#f4f7f9] text-[#657786] text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
