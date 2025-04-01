import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ContentGenerationResponse, UrlFormData } from "@/types/content";
import { useState } from "react";

export function useUrlAnalysis() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<ContentGenerationResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (formData: UrlFormData) => {
      const response = await apiRequest("POST", "/api/analyze-url", formData);
      const result = await response.json();
      return result as ContentGenerationResponse;
    },
    onSuccess: (responseData) => {
      // Store the result in state
      setData(responseData);
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/analyze-url'] });
    },
  });

  return {
    analyzeUrl: mutation.mutate,
    data,
    error: mutation.error,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    reset: () => {
      setData(null);
      mutation.reset();
    }
  };
}
