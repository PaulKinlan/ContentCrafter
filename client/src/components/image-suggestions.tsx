import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ImageSuggestionsProps {
  images: string[];
}

export default function ImageSuggestions({ images }: ImageSuggestionsProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white rounded-xl shadow-md mb-8">
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-xl font-semibold">Suggested Images</CardTitle>
        <Button variant="link" className="text-primary text-sm font-medium hover:underline h-auto p-0">
          View all images
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="image-suggestion relative group cursor-pointer">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200">
                <img 
                  src={image} 
                  alt={`Suggested image ${index + 1}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <Button variant="default" size="icon" className="bg-white text-primary h-8 w-8 rounded-full">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
