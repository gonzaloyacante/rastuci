"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '../ui/Button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { LoadingSkeleton } from '../ui/LoadingStates';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  loading?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  viewMode = 'grid',
  loading = false,
  className = '',
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, 'M', 'Sin color');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
      });
    }
  };

  if (loading) {
    return (
      <div className={`surface rounded-lg border border-muted overflow-hidden ${className}`}>
        {viewMode === 'grid' ? (
          <div className="space-y-3 p-4">
            <LoadingSkeleton className="aspect-square rounded-lg" />
            <LoadingSkeleton lines={2} />
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        ) : (
          <div className="flex space-x-4 p-4">
            <LoadingSkeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton lines={3} />
              <LoadingSkeleton className="h-8 w-20" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const primaryImage = product.images[0] || '/placeholder.jpg';
  const isOnSale = product.onSale;
  const isOutOfStock = product.stock === 0;
  const isInFavorites = isInWishlist(product.id);

  if (viewMode === 'list') {
    return (
      <Link href={`/productos/${product.id}`} className={`block ${className}`}>
        <div className="surface rounded-lg border border-muted hover-surface transition-all duration-200 overflow-hidden group product-card">
          <div className="flex space-x-4 p-4">
            {/* Image */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                sizes="96px"
              />
              {isOnSale && (
                <span className="absolute top-1 left-1 badge-error text-xs px-2 py-1 rounded">
                  Oferta
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm muted line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.category && (
                      <span className="text-xs muted">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'muted'
                          }`}
                        />
                      ))}
                      <span className="text-xs muted">(4.0)</span>
                    </div>
                    
                    {isOutOfStock && (
                      <span className="text-xs text-error font-medium">
                        Sin stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={`p-2 ${isInFavorites ? 'text-primary' : ''}`}
                    aria-label={isInFavorites ? "Quitar de favoritos" : "Agregar a favoritos"}
                  >
                    <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="px-3"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/productos/${product.id}`} className={`block ${className}`}>
      <div className="surface rounded-lg border border-muted hover-surface transition-all duration-200 overflow-hidden group product-card">
        <div className="relative aspect-square">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {isOnSale && (
              <span className="badge-error text-xs px-2 py-1 rounded">
                Oferta
              </span>
            )}
            {isOutOfStock && (
              <span className="badge-error text-xs px-2 py-1 rounded">
                Sin stock
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`p-2 surface rounded-full shadow-sm ${isInFavorites ? 'text-primary' : ''}`}
              aria-label={isInFavorites ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Quick add button */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              fullWidth
              className="shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {product.category && (
            <p className="text-sm muted mb-2">{product.category.name}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ${product.price.toLocaleString()}
            </span>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < 4 ? 'text-yellow-400 fill-current' : 'muted'
                  }`}
                />
              ))}
              <span className="text-xs muted ml-1">(4.0)</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
