import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

const categories = ["All", "Cakes", "Cupcakes", "Pastries", "Custom"];

export default function CatalogSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/catalog"],
  });

  const filteredProducts = products?.filter((product) => {
    if (selectedCategory === "All") return true;
    return product.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-gradient-to-b from-card/40 to-background" id="catalog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-accent-foreground" />
            Browse our menu
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            data-testid="heading-catalog"
          >
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Ready to Order
            </span>
          </h2>
          <p className="text-center text-muted-foreground text-lg mt-3">
            Browse our delicious collection
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`min-w-24 rounded-full ${selectedCategory === category ? "" : "bg-card"}`}
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-card rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
