import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import UrlForm from "@/components/url-form";
import LoadingState from "@/components/loading-state";
import SourceContentPreview from "@/components/source-content";
import ImageSuggestions from "@/components/image-suggestions";
import PlatformPosts from "@/components/platform-posts";
import { useUrlAnalysis } from "@/hooks/use-url-analysis";
import { UrlFormData } from "@/types/content";

export default function Home() {
  const { analyzeUrl, data, isPending, isSuccess, isError, error } = useUrlAnalysis();

  const handleFormSubmit = (formData: UrlFormData) => {
    analyzeUrl(formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-[#14171A]">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <UrlForm onSubmit={handleFormSubmit} isLoading={isPending} />
        
        {isPending && (
          <div className="mt-8">
            <LoadingState />
          </div>
        )}
        
        {isError && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
          </div>
        )}
        
        {isSuccess && data && (
          <div className="space-y-8 mt-8">
            <SourceContentPreview content={data.sourceContent} />
            
            <ImageSuggestions images={data.sourceContent.images} />
            
            <PlatformPosts data={data} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
