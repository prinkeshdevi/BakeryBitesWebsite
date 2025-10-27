import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left: Image Logo (larger) */}
          <Link href="/">
            <div
              className="flex items-center px-1 py-1 -ml-2 md:-ml-3 transition-all duration-300 cursor-pointer"
              data-testid="link-home"
            >
              <img
                src="/assets/WhatsApp%20Image%202025-10-27%20at%2021.30.54_88b1f8cf_1761586559405.jpg"
                alt="Bakery Bites - 100% Eggless Baking House logo"
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain rounded-md shadow-sm hover:opacity-90"
                loading="eager"
                decoding="async"
              />
            </div>
          </Link>

          {/* Desktop Navigation (no right-side logo) */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="https://www.instagram.com/bakery_bites21/?hl=eng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover-elevate rounded-lg px-4 py-2 transition-all duration-300"
              data-testid="link-instagram"
            >
              <Instagram className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Follow Us</span>
            </a>
            <Button
              variant="default"
              asChild
              data-testid="button-order"
            >
              <a href="tel:+918788463432">Order Now</a>
            </Button>
          </div>

          {/* Mobile Menu Button (no right-side logo) */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <a
              href="https://www.instagram.com/bakery_bites21/?hl=eng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover-elevate rounded-lg px-4 py-3 transition-all duration-300"
              data-testid="link-instagram-mobile"
            >
              <Instagram className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Follow Us on Instagram</span>
            </a>
            <Button
              variant="default"
              className="w-full"
              asChild
              data-testid="button-order-mobile"
            >
              <a href="tel:+918788463432">Order Now - +91 8788463432</a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
