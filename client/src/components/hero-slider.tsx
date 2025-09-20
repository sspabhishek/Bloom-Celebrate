import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Import local images
import anversari from "@/../public/assets/Anversari.png";
import anversari2 from "@/../public/assets/Anversari2.png";
import birthday from "@/../public/assets/Birthday.png";
import corporate from "@/../public/assets/Corporate.png";
import corporate2 from "@/../public/assets/Corporae2.png";
import wedding from "@/../public/assets/Wedding.png";

const heroSlides = [
  {
    image: birthday,
    alt: "Vibrant birthday balloon decorations"
  },
  {
    image: corporate,
    alt: "Professional corporate event decorations"
  },
  {
    image: wedding,
    alt: "Romantic wedding balloon arrangements"
  },
  {
    image: anversari,
    alt: "Elegant balloon decorations for any occasion"
  },
  {
    image: corporate2,
    alt: "Elegant corporate event setups"
  },
  {
    image: anversari2,
    alt: "Stunning balloon arrangements for special events"
  },
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
    <section
      id="home"
      className="relative min-h-[60vw] sm:min-h-[70svh] md:min-h-[90svh] overflow-hidden"
      data-testid="hero-section"
    >

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
          <div className="max-w-2xl pt-7 sm:pt-14 md:pt-20 text-left pl-1 sm:pl-0">
            <h1 className="text-xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3 sm:mb-6 animate-fade-in" data-testid="hero-title">
              Balloon Decoration in Noida, Delhi, Gurugram & Ghaziabad
            </h1>
            <p className="text-xs sm:text-base md:text-lg text-white/90 mb-5 sm:mb-8 animate-fade-in max-w-lg" data-testid="hero-subtitle">
              Transform your special moments with stunning balloon arches and exquisite floral arrangements that create unforgettable memories.
            </p>
            <div className="flex flex-row flex-nowrap gap-2 sm:gap-3 items-center animate-fade-in -mt-1 sm:mt-0">
              <Button 
                onClick={scrollToGallery}
                data-testid="button-explore-gallery"
                className="inline-flex items-center whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors shadow-lg w-auto"
              >
                Explore Our Gallery
              </Button>
              <Button 
                variant="outline"
                onClick={scrollToContact}
                data-testid="button-get-quote"
                className="inline-flex items-center whitespace-nowrap border-2 border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg w-auto"
              >
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slider Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-20" data-testid="slider-dots">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            data-testid={`slider-dot-${index}`}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full transition-opacity ${
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
        className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-primary text-2xl sm:text-3xl z-20 transition-colors p-2"
      >
        <i className="fas fa-chevron-left"></i>
      </Button>
      <Button
        variant="ghost"
        onClick={nextSlide}
        data-testid="button-next-slide"
        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-primary text-2xl sm:text-3xl z-20 transition-colors p-2"
      >
        <i className="fas fa-chevron-right"></i>
      </Button>
    </section>
  );
}
