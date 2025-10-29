import { useState, useEffect, useRef, MouseEvent, TouchEvent, KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero1 from "@assets/generated_images/Pink_birthday_cake_hero_1b0daf87.png";
import hero2 from "@assets/generated_images/Pastel_cupcakes_arrangement_hero_0b4c44fa.png";
import hero3 from "@assets/generated_images/Wedding_cake_hero_image_f0dd6599.png";
import hero4 from "@assets/generated_images/Macarons_and_pastries_hero_2165da4f.png";
import hero5 from "@assets/generated_images/Custom_decorated_cake_hero_f6649382.png";

const slides = [
  {
    image: hero1,
    title: "Celebrate Every Moment",
    subtitle: "100% Eggless | Fresh Daily | Custom Designs",
  },
  {
    image: hero2,
    title: "Artisan Cupcakes & Treats",
    subtitle: "Handcrafted with Love | Premium Ingredients",
  },
  {
    image: hero3,
    title: "Dream Wedding Cakes",
    subtitle: "Elegant | Customizable | Unforgettable",
  },
  {
    image: hero4,
    title: "French Delicacies",
    subtitle: "Macarons | Pastries | Sweet Perfection",
  },
  {
    image: hero5,
    title: "Custom Creations",
    subtitle: "Your Vision | Our Expertise | Pure Magic",
  },
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Auto-play with visibility pause
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    const handleVisibility = () => {
      if (document.hidden) {
        setIsAutoPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAutoPlaying]);

  const temporarilyPauseAutoPlay = (ms = 10000) => {
    setIsAutoPlaying(false);
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setIsAutoPlaying(true);
    }, ms) as unknown as number;
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    temporarilyPauseAutoPlay();
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  // Pause on hover/focus, resume on leave/blur
  const handleMouseEnter = (_e: MouseEvent) => {
    setIsAutoPlaying(false);
  };
  const handleMouseLeave = (_e: MouseEvent) => {
    temporarilyPauseAutoPlay(4000);
  };
  const handleFocus = () => setIsAutoPlaying(false);
  const handleBlur = () => temporarilyPauseAutoPlay(4000);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  // Touch swipe
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    if (startX == null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    const threshold = 40; // px
    if (delta > threshold) {
      // swipe right -> previous
      prevSlide();
    } else if (delta < -threshold) {
      // swipe left -> next
      nextSlide();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[70vh] lg:h-[80vh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured bakery items"
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== currentSlide}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                {slide.title}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {slide.subtitle}
              </p>
              <Button
                size="lg"
                className="px-8 py-6 text-lg backdrop-blur-sm bg-primary/90 hover:bg-primary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                asChild
                data-testid="button-order-hero"
              >
                <a href="tel:+918788463432">Order Now</a>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-md hover:bg-white/25 text-white rounded-full w-12 h-12 sm:w-12 sm:h-12 shadow-md transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/70"
        onClick={prevSlide}
        aria-label="Previous slide"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-md hover:bg-white/25 text-white rounded-full w-12 h-12 sm:w-12 sm:h-12 shadow-md transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/70"
        onClick={nextSlide}
        aria-label="Next slide"
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3">
        {slides.map((_, index) => {
          const active = index === currentSlide;
          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                active ? "bg-white w-8" : "bg-white/60 hover:bg-white/80 w-2.5"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={active ? "true" : "false"}
              data-testid={`button-slide-${index}`}
            />
          );
        })}
      </div>
    </div>
  );
}
