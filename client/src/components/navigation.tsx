import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onToggleAdmin: () => void;
}

export default function Navigation({ onToggleAdmin }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-primary" data-testid="logo">
              <i className="fas fa-heart text-accent mr-2"></i>Bloom & Celebrate
            </h1>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Button 
                variant="ghost" 
                onClick={() => scrollToSection('home')}
                data-testid="nav-home"
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => scrollToSection('gallery')}
                data-testid="nav-gallery"
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Gallery
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => scrollToSection('contact')}
                data-testid="nav-contact"
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Contact
              </Button>
              <Button 
                variant="ghost" 
                onClick={onToggleAdmin}
                data-testid="nav-admin"
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                <i className="fas fa-cog"></i>
              </Button>
            </div>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              className="text-foreground hover:text-primary p-2"
            >
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('home')}
              data-testid="mobile-nav-home"
              className="text-foreground block w-full text-left px-3 py-2 text-base font-medium"
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('gallery')}
              data-testid="mobile-nav-gallery"
              className="text-foreground block w-full text-left px-3 py-2 text-base font-medium"
            >
              Gallery
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('contact')}
              data-testid="mobile-nav-contact"
              className="text-foreground block w-full text-left px-3 py-2 text-base font-medium"
            >
              Contact
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
