import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import type { Product } from "@shared/schema";

export default function OurChoice() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/choice"],
  });

  if (isLoading) {
    return (
      <section className="py-14 sm:py-18 lg:py-24 bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Chef’s Picks
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Our Choice
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-background rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-card/60" id="choice">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Chef’s Picks
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            data-testid="heading-our-choice"
          >
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Our Choice
            </span>
          </h2>
          <p className="text-center text-muted-foreground text-lg mt-3">
            Chef-recommended and signature creations
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
