import { Card } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
      <div className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg text-[#14171A]">Analyzing content and generating suggestions...</p>
      <p className="text-sm text-[#657786] mt-2">This may take a few moments</p>
    </Card>
  );
}
