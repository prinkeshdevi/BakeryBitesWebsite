import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import type { Product } from "@shared/schema";

export default function OurChoice() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/choice"],
  });

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Our Choice
          </h2>
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
    <section className="py-12 sm:py-16 lg:py-20 bg-card" id="choice">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4"
          data-testid="heading-our-choice"
        >
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Our Choice
          </span>
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12">
          Chef-recommended and signature creations
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
