import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080",
    alt: "Spectacular balloon arch display for grand event entrance"
  },
  {
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080",
    alt: "Elegant white and pink wedding balloon decorations"
  },
  {
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1920&h=1080&q=80",
    alt: "Beautiful floral arrangements for luxury wedding ceremony"
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[60svh] sm:min-h-[70svh] md:min-h-[100svh] overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide absolute inset-0 bg-cover bg-center ${
              index === currentSlide ? 'active' : ''
            }`}
            style={{ backgroundImage: `url('${slide.image}')` }}
            data-testid={`hero-slide-${index}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          </div>
        ))}
      </div>
      
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl pt-20">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-6 animate-fade-in" data-testid="hero-title">
              We Make Celebrations <span className="text-accent">Bloom!</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 animate-fade-in" data-testid="hero-subtitle">
              Transform your special moments with stunning balloon arches and exquisite floral arrangements that create unforgettable memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in">
              <Button 
                onClick={scrollToGallery}
                data-testid="button-explore-gallery"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg w-full sm:w-auto"
              >
                Explore Our Gallery
              </Button>
              <Button 
                variant="outline"
                onClick={scrollToContact}
                data-testid="button-get-quote"
                className="border-2 border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-lg transition-all shadow-lg w-full sm:w-auto"
              >
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slider Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20" data-testid="slider-dots">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            data-testid={`slider-dot-${index}`}
            className={`w-3 h-3 bg-white rounded-full transition-opacity ${
              index === currentSlide ? 'opacity-100' : 'opacity-50'
            } hover:opacity-100`}
          />
        ))}
      </div>
      
      {/* Arrow Navigation */}
      <Button
        variant="ghost"
        onClick={previousSlide}
        data-testid="button-previous-slide"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-primary text-3xl z-20 transition-colors p-2"
      >
        <i className="fas fa-chevron-left"></i>
      </Button>
      <Button
        variant="ghost"
        onClick={nextSlide}
        data-testid="button-next-slide"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-primary text-3xl z-20 transition-colors p-2"
      >
        <i className="fas fa-chevron-right"></i>
      </Button>
    </section>
  );
}
