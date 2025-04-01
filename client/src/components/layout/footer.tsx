import { Twitter, Linkedin, Cloud } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Social Content Planner</h3>
            <p className="text-[#657786]">Create platform-optimized social media content in seconds from any webpage.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#657786] hover:text-primary transition-colors">Home</a></li>
              <li><a href="#" className="text-[#657786] hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-[#657786] hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-[#657786] hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4 text-xl">
              <a href="#" className="text-[#657786] hover:text-primary transition-colors">
                <Twitter />
              </a>
              <a href="#" className="text-[#657786] hover:text-primary transition-colors">
                <Linkedin />
              </a>
              <a href="#" className="text-[#657786] hover:text-primary transition-colors">
                <Cloud />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-[#657786]">
          <p>&copy; {new Date().getFullYear()} Social Content Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
