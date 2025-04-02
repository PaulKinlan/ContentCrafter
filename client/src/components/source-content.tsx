import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SourceContent } from "@/types/content";

interface SourceContentProps {
  content: SourceContent;
}

export default function SourceContentPreview({ content }: SourceContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to format the full content for better readability
  const formatFullContent = (text: string | undefined) => {
    if (!text) return "No content available";
    // Split text into paragraphs and handle them individually
    return text.split(/\n\n+/).map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  return (
    <Card className="bg-white rounded-xl shadow-md mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Source Content</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#657786] hover:text-primary"
        >
          {isExpanded ? (
            <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
          ) : (
            <><ChevronDown className="h-4 w-4 mr-1" /> View Full Content</>
          )}
        </Button>
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

      {/* Expandable content section */}
      {isExpanded && (
        <CardContent className="pt-0 border-t mt-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="full-content">
              <AccordionTrigger className="text-sm font-medium">
                Full Content (Sent to LLM)
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                  {formatFullContent(content.content)}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="raw-data">
              <AccordionTrigger className="text-sm font-medium">
                Raw Data Structure
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-96">
                  <pre className="text-xs">{JSON.stringify(content, null, 2)}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}
