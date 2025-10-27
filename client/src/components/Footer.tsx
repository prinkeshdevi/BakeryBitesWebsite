import { Instagram, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Bakery Bites</h3>
            <p className="text-background/80 text-sm">
              100% eggless bakery crafting delicious cakes, cupcakes, and pastries
              for every celebration. Quality ingredients, creative designs,
              unforgettable taste.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#popular" className="text-background/80 hover:text-primary transition-colors">
                  Most Popular
                </a>
              </li>
              <li>
                <a href="#choice" className="text-background/80 hover:text-primary transition-colors">
                  Our Choice
                </a>
              </li>
              <li>
                <a href="#custom-order" className="text-background/80 hover:text-primary transition-colors">
                  Custom Orders
                </a>
              </li>
              <li>
                <a href="#catalog" className="text-background/80 hover:text-primary transition-colors">
                  Catalog
                </a>
              </li>
              <li>
                <a href="#contact" className="text-background/80 hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <a
                  href="tel:+918788463432"
                  className="text-background/80 hover:text-primary transition-colors"
                  data-testid="link-footer-phone"
                >
                  +91 8788463432
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-background/80">info@bakerybites21.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Instagram className="w-4 h-4 text-primary" />
                <a
                  href="https://www.instagram.com/bakery_bites21/?hl=eng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-primary transition-colors"
                  data-testid="link-footer-instagram"
                >
                  @bakery_bites21
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/20 pt-8 text-center">
          <p className="text-background/60 text-sm" data-testid="text-copyright">
            © 2023 Bakery Bites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
