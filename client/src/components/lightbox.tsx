import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LightboxProps {
  isOpen: boolean;
  images: string[];
  designId: string;
  title: string;
  onClose: () => void;
  onRequestDesign: (designId: string) => void;
}

export default function Lightbox({ 
  isOpen, 
  images, 
  designId, 
  title, 
  onClose, 
  onRequestDesign 
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Reset current index when lightbox opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);
  
  if (!isOpen || !images || images.length === 0) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRequestDesign = () => {
    onRequestDesign(designId);
  };
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 modal"
      onClick={handleBackdropClick}
      data-testid="lightbox-modal"
    >
      <Card className="relative max-w-4xl w-full rounded-2xl overflow-hidden">
        <Button
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-lightbox"
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center z-10 transition-colors p-0"
        >
          <i className="fas fa-times"></i>
        </Button>
        <div className="relative">
          <img
            src={images[currentIndex]}
            alt={`${title} ${designId} - Image ${currentIndex + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain"
            data-testid={`lightbox-image-${currentIndex}`}
          />
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <Button
                  variant="ghost"
                  onClick={previousImage}
                  data-testid="button-lightbox-prev"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 flex items-center justify-center transition-colors p-0"
                >
                  <i className="fas fa-chevron-left text-xl"></i>
                </Button>
              )}
              {currentIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={nextImage}
                  data-testid="button-lightbox-next"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 flex items-center justify-center transition-colors p-0"
                >
                  <i className="fas fa-chevron-right text-xl"></i>
                </Button>
              )}
            </>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2" data-testid="lightbox-title">
                {title}
              </h3>
              <div className="flex items-center space-x-3">
                <Badge className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium" data-testid="lightbox-design-id">
                  {designId}
                </Badge>
                {images.length > 1 && (
                  <span className="text-sm text-muted-foreground" data-testid="lightbox-image-counter">
                    {currentIndex + 1} / {images.length}
                  </span>
                )}
              </div>
              
              {/* Dots indicator for multiple images */}
              {images.length > 1 && (
                <div className="flex space-x-2 mt-3" data-testid="lightbox-dots">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === currentIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                      data-testid={`lightbox-dot-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleRequestDesign}
              data-testid="button-request-lightbox"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-heart mr-2"></i>Request This Design
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
