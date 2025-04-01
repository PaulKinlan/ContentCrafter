import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  goal: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UrlFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      goal: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    if (isLoading) return;
    onSubmit(data);
  };

  return (
    <Card className="bg-white rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Generate Social Media Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-text">
                    Enter webpage URL to generate content
                  </FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input
                        placeholder="https://example.com/article"
                        className="flex-grow rounded-l-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-primary text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Generate
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-text">
                    Content goal (optional)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                        <SelectValue placeholder="Select a goal (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No specific goal</SelectItem>
                      <SelectItem value="engagement">Maximize engagement</SelectItem>
                      <SelectItem value="awareness">Increase brand awareness</SelectItem>
                      <SelectItem value="traffic">Drive traffic</SelectItem>
                      <SelectItem value="conversion">Boost conversions</SelectItem>
                      <SelectItem value="authority">Build authority</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
