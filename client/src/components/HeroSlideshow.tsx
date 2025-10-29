import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[70vh] lg:h-[80vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur mb-4 animate-in fade-in duration-700">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Freshly baked • 100% Eggless • Custom Designs
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                {slide.title}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {slide.subtitle}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg rounded-full backdrop-blur-sm bg-primary/90 hover:bg-primary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                  asChild
                  data-testid="button-order-hero"
                >
                  <a href="tel:+918788463432">Order Now</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg rounded-full border-white/40 text-white hover:bg-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                  asChild
                >
                  <a href="#catalog">Browse Catalog</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
        onClick={prevSlide}
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
        onClick={nextSlide}
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            data-testid={`button-slide-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
