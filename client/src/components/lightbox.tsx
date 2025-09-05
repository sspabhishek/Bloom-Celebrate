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
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center py-8 px-4 modal"
      onClick={handleBackdropClick}
      data-testid="lightbox-modal"
    >
      <Card className="relative max-w-5xl w-full max-h-full flex flex-col rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm bg-background/95 dark:bg-card/95 border border-border/20 dark:border-border/30">
        <Button
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-lightbox"
          className="absolute top-6 right-6 text-white dark:text-white bg-black/30 dark:bg-black/50 hover:bg-black/50 dark:hover:bg-black/70 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-all duration-200 backdrop-blur-sm p-0"
        >
          <i className="fas fa-times text-lg"></i>
        </Button>
        <div className="relative flex-1 flex items-center justify-center p-6 pb-0 min-h-0">
          <img
            src={images[currentIndex]}
            alt={`${title} ${designId} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
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
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white dark:text-white bg-black/20 dark:bg-black/30 hover:bg-black/40 dark:hover:bg-black/60 rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 backdrop-blur-sm p-0 border border-white/20 dark:border-white/10"
                >
                  <i className="fas fa-chevron-left text-xl"></i>
                </Button>
              )}
              {currentIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={nextImage}
                  data-testid="button-lightbox-next"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white dark:text-white bg-black/20 dark:bg-black/30 hover:bg-black/40 dark:hover:bg-black/60 rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 backdrop-blur-sm p-0 border border-white/20 dark:border-white/10"
                >
                  <i className="fas fa-chevron-right text-xl"></i>
                </Button>
              )}
            </>
          )}
        </div>
        <CardContent className="p-8 pt-6 flex-shrink-0 bg-background/95 dark:bg-card/95 backdrop-blur-md border-t border-border/20">
          <div className="text-center space-y-6">
            {/* Title and Design Info */}
            <div className="space-y-3">
              <h3 className="text-3xl font-serif font-bold text-foreground dark:text-foreground mb-2" data-testid="lightbox-title">
                {title}
              </h3>
              <div className="flex items-center justify-center space-x-4">
                <Badge className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full font-medium text-base" data-testid="lightbox-design-id">
                  {designId}
                </Badge>
                {images.length > 1 && (
                  <span className="text-base text-muted-foreground dark:text-muted-foreground bg-muted/50 dark:bg-muted/50 px-4 py-2 rounded-full" data-testid="lightbox-image-counter">
                    {currentIndex + 1} of {images.length}
                  </span>
                )}
              </div>
            </div>

            {/* Dots indicator for multiple images */}
            {images.length > 1 && (
              <div className="flex justify-center space-x-3 py-2" data-testid="lightbox-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-primary shadow-lg scale-125' 
                        : 'bg-muted dark:bg-muted hover:bg-primary/50 dark:hover:bg-primary/50'
                    }`}
                    data-testid={`lightbox-dot-${index}`}
                  />
                ))}
              </div>
            )}

            {/* Request Button */}
            <div className="pt-4">
              <Button
                onClick={handleRequestDesign}
                data-testid="button-request-lightbox"
                className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <i className="fas fa-heart mr-3"></i>Request This Design
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
