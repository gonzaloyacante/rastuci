"use client";

import React from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
// import { LoadingPage } from "@/components/ui/LoadingComponents"; // TODO: Implement when needed
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

export default function FavoritosPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    // Convert wishlist item to product format for addToCart
    const product: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      images: [item.image],
      description: '',
      categoryId: 'default',
      stock: 1,
      onSale: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addToCart(product, 1, 'default', 'default');
  };

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id);
  };

  const handleClearWishlist = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
      clearWishlist();
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full surface flex items-center justify-center">
            <Heart className="w-8 h-8 muted" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Tu lista de favoritos está vacía</h1>
          <p className="muted mb-6">
            Agrega productos a tu lista de favoritos para verlos aquí más tarde.
          </p>
          <Link href="/productos">
            <Button variant="primary">
              Explorar productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mis Favoritos</h1>
          <p className="muted">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'} en tu lista de favoritos
          </p>
        </div>
        
        {wishlistItems.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            className="text-error border-error hover:bg-error hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar lista
          </Button>
        )}
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="surface rounded-lg border border-muted overflow-hidden group hover-surface transition-all duration-200"
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              
              {/* Remove from wishlist button */}
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="p-2 surface rounded-full shadow-sm text-error hover:bg-error hover:text-white"
                  aria-label="Quitar de favoritos"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>

              {/* Added date */}
              <div className="absolute bottom-2 left-2">
                <span className="text-xs surface px-2 py-1 rounded text-primary">
                  {new Date(item.addedAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <Link href={`/productos/${item.id}`}>
                <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                  {item.name}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-primary">
                  ${item.price.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  fullWidth
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Agregar al carrito
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="px-3 text-error border-error hover:bg-error hover:text-white"
                  aria-label="Quitar de favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue shopping */}
      <div className="text-center mt-12">
        <Link href="/productos">
          <Button variant="outline">
            Seguir comprando
          </Button>
        </Link>
      </div>
    </div>
  );
}
