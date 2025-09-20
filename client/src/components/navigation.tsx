import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface NavigationProps {
  onToggleAdmin: () => void;
}

export default function Navigation({ onToggleAdmin }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <img 
                src="/assets/logo.png" 
                alt="Site Logo" 
                className="h-12 md:h-16 w-auto object-contain"
                loading="lazy"
              />
            </div>
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
                onClick={toggleTheme}
                data-testid="nav-theme-toggle"
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
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
          
          <div className="md:hidden flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              data-testid="mobile-nav-theme-toggle"
              aria-label="Toggle theme"
              className="text-muted-foreground hover:text-primary p-2"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </Button>
            <Button
              variant="ghost"
              onClick={onToggleAdmin}
              data-testid="mobile-nav-admin"
              aria-label="Open admin panel"
              className="text-muted-foreground hover:text-primary p-2"
            >
              <i className="fas fa-cog text-lg"></i>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
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
