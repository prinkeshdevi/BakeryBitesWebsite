import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import type { Product } from "@shared/schema";

export default function MostPopular() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/popular"],
  });

  if (isLoading) {
    return (
      <section className="py-14 sm:py-18 lg:py-24 bg-gradient-to-b from-background to-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Crowd Favorites
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Most Popular
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-card rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-gradient-to-b from-background to-card/40" id="popular">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Crowd Favorites
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            data-testid="heading-most-popular"
          >
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Most Popular
            </span>
          </h2>
          <p className="text-center text-muted-foreground text-lg mt-3">
            Customer favorites that keep them coming back
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
