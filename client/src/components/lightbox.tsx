import React from "react";
import { FALLBACK_IMAGE_URL } from "@/config";
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

  // Calculate max height for the image based on viewport
  const maxImageHeight = 'calc(100vh - 300px)';
  const maxImageHeightSm = '60vh';

  return (
    <div 
      className="fixed inset-0 bg-black/90 dark:bg-black/95 z-50 flex flex-col items-center p-0 overflow-y-auto"
      onClick={handleBackdropClick}
      data-testid="lightbox-modal"
    >
      <div className="w-full min-h-full max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 flex flex-col">
        <Card className="relative w-full flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border-0 sm:border border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-lightbox"
            className="fixed top-4 right-4 sm:absolute sm:right-6 sm:top-6 text-white dark:text-gray-200 bg-black/50 dark:bg-gray-800/90 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white rounded-full w-10 h-10 flex items-center justify-center z-50 transition-all duration-200 shadow-lg p-0 border border-white/20"
            aria-label="Close lightbox"
          >
            <i className="fas fa-times text-lg"></i>
          </Button>
          
          {/* Image Section */}
          <div className="relative w-full" style={{ minHeight: '60vh' }}>
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-2 sm:p-4">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={images[currentIndex] || FALLBACK_IMAGE_URL}
                  alt={`${title} ${designId} - Image ${currentIndex + 1}`}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_IMAGE_URL) {
                      e.currentTarget.src = FALLBACK_IMAGE_URL;
                    }
                  }}
                  data-testid={`lightbox-image-${currentIndex}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    margin: '0 auto',
                    display: 'block',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
          
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  {currentIndex > 0 && (
                    <Button
                      variant="ghost"
                      onClick={previousImage}
                      data-testid="button-lightbox-prev"
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-200 shadow-lg p-0 border border-gray-200 dark:border-gray-600 z-10"
                    >
                      <i className="fas fa-chevron-left text-base sm:text-lg"></i>
                    </Button>
                  )}
                  {currentIndex < images.length - 1 && (
                    <Button
                      variant="ghost"
                      onClick={nextImage}
                      data-testid="button-lightbox-next"
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-200 shadow-lg p-0 border border-gray-200 dark:border-gray-600 z-10"
                    >
                      <i className="fas fa-chevron-right text-base sm:text-lg"></i>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Content Section - All text and buttons at the bottom */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-6">
            {/* Title */}
            <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white" data-testid="lightbox-title">
              {title}
            </h3>
            
            {/* Design Info Row */}
            <div className="flex items-center justify-center space-x-4">
              <Badge className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 dark:border-primary/40 px-6 py-2 rounded-full font-medium text-base" data-testid="lightbox-design-id">
                {designId}
              </Badge>
              {images.length > 1 && (
                <span className="text-base text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full font-medium" data-testid="lightbox-image-counter">
                  {currentIndex + 1} of {images.length}
                </span>
              )}
            </div>

            {/* Navigation Dots - Highly visible */}
            {images.length > 1 && (
              <div className="flex justify-center space-x-3 py-4" data-testid="lightbox-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                      index === currentIndex 
                        ? 'bg-primary border-primary shadow-lg scale-125' 
                        : 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600 hover:bg-primary/70 dark:hover:bg-primary/70 hover:border-primary/70 dark:hover:border-primary/70'
                    }`}
                    data-testid={`lightbox-dot-${index}`}
                  />
                ))}
              </div>
            )}

            {/* Request Button */}
            <div className="pt-2">
              <Button
                onClick={handleRequestDesign}
                data-testid="button-request-lightbox"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <i className="fas fa-heart mr-2 sm:mr-3"></i>Request This Design
              </Button>
            </div>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
