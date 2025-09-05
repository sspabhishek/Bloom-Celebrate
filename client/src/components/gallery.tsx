import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { GalleryImage, CategoryFilter } from "@/lib/types";

interface ImageSliderProps {
  images: string[];
  title: string;
  designId: string;
  onImageClick: () => void;
}

function ImageSlider({ images, title, designId, onImageClick }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const previousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };
  
  return (
    <div className="relative group" onClick={onImageClick}>
      <img
        src={images[currentIndex]}
        alt={`${title} ${designId} - Image ${currentIndex + 1}`}
        className="w-full h-48 object-cover transition-opacity duration-300"
        data-testid={`image-${designId}-${currentIndex}`}
      />
      
      {images.length > 1 && (
        <>
          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={previousImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
              data-testid={`button-prev-${designId}`}
            >
              <i className="fas fa-chevron-left text-sm"></i>
            </Button>
          )}
          {currentIndex < images.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
              data-testid={`button-next-${designId}`}
            >
              <i className="fas fa-chevron-right text-sm"></i>
            </Button>
          )}
          
          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1" data-testid={`slider-dots-${designId}`}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                data-testid={`slider-dot-${designId}-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface GalleryProps {
  onOpenLightbox: (images: string[], designId: string, title: string) => void;
  onRequestDesign: (designId: string) => void;
}

export default function Gallery({ onOpenLightbox, onRequestDesign }: GalleryProps) {
  const [currentFilter, setCurrentFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: images = [], isLoading, error } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery', { category: currentFilter, search: debouncedSearch }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentFilter !== 'all') params.append('category', currentFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      const response = await fetch(`/api/gallery?${params}`);
      if (!response.ok) throw new Error('Failed to fetch gallery images');
      return response.json();
    }
  });

  const filterButtons: { category: CategoryFilter; label: string }[] = [
    { category: 'all', label: 'All' },
    { category: 'birthdays', label: 'Birthdays' },
    { category: 'weddings', label: 'Weddings' },
    { category: 'corporate', label: 'Corporate' }
  ];

  const handleImageClick = (image: GalleryImage) => {
    onOpenLightbox(image.imagePaths, image.designId, image.title);
  };

  if (error) {
    return (
      <section id="gallery" className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive">Failed to load gallery images. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 bg-muted" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4" data-testid="gallery-title">
            Our Stunning Portfolio
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="gallery-subtitle">
            Discover our diverse collection of event decorations, from intimate celebrations to grand corporate events.
          </p>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
              <Input
                type="text"
                placeholder="Search by ID or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-card"
              />
            </div>
            <div className="flex space-x-2" data-testid="filter-buttons">
              {filterButtons.map(({ category, label }) => (
                <Button
                  key={category}
                  variant={currentFilter === category ? "default" : "outline"}
                  onClick={() => setCurrentFilter(category)}
                  data-testid={`filter-${category}`}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentFilter === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground hover:text-primary border border-border'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="gallery-loading">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12" data-testid="gallery-empty">
            <i className="fas fa-images text-6xl text-muted-foreground mb-4"></i>
            <h3 className="text-xl font-semibold text-foreground mb-2">No images found</h3>
            <p className="text-muted-foreground">
              {searchQuery || currentFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Gallery images will appear here once uploaded.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="gallery-grid">
            {images.map((image) => (
              <Card 
                key={image.id} 
                className="gallery-item overflow-hidden shadow-lg cursor-pointer"
                data-testid={`gallery-item-${image.designId}`}
              >
                <ImageSlider
                  images={image.imagePaths}
                  title={image.title}
                  designId={image.designId}
                  onImageClick={() => handleImageClick(image)}
                />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium"
                      data-testid={`badge-${image.designId}`}
                    >
                      {image.designId}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                      data-testid={`category-${image.designId}`}
                    >
                      {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" data-testid={`title-${image.designId}`}>
                    {image.title}
                  </h3>
                  <Button
                    onClick={() => onRequestDesign(image.designId)}
                    data-testid={`button-request-${image.designId}`}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg transition-colors font-medium"
                  >
                    <i className="fas fa-heart mr-2"></i>Request This Design
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
