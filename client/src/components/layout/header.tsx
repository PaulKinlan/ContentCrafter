import { Button } from "@/components/ui/button";
import { HelpCircle, User, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Share2 className="mr-2" />
          Social Content Planner
        </h1>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-[#657786] hover:text-primary transition-colors">
            <HelpCircle className="mr-2 h-4 w-4" /> Help
          </Button>
          <Button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <User className="mr-2 h-4 w-4" /> Sign In
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-[#657786] text-xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </Button>
      </div>
      
      {isMobileMenuOpen && isMobile && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start text-[#657786] hover:text-primary transition-colors">
                <HelpCircle className="mr-2 h-4 w-4" /> Help
              </Button>
              <Button className="justify-start bg-primary text-white hover:bg-blue-600 transition-colors">
                <User className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
