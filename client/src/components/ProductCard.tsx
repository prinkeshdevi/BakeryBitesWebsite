import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      className="overflow-hidden hover-elevate transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {product.isChefChoice && (
          <Badge
            className="absolute top-3 right-3 bg-secondary text-secondary-foreground"
            data-testid={`badge-chef-choice-${product.id}`}
          >
            Chef's Choice
          </Badge>
        )}
        {product.isSignature && (
          <Badge
            className="absolute top-3 right-3 bg-primary text-primary-foreground"
            data-testid={`badge-signature-${product.id}`}
          >
            Signature
          </Badge>
        )}
      </div>
      <CardContent className="p-4 sm:p-6">
        <h3
          className="text-lg sm:text-xl font-semibold text-foreground mb-2"
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-xl sm:text-2xl font-bold text-primary"
            data-testid={`text-price-${product.id}`}
          >
            ₹{product.price}
          </span>
          <Badge variant="outline" className="text-sm">
            {product.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
