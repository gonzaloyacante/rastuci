'use client';

import { useState } from 'react';
import { useComparison } from '@/context/ComparisonContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { X, Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';

// Extended product type for comparison features
type ProductWithExtras = Record<string, unknown> & {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
};

export function ProductComparison() {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);

  if (comparisonItems.length === 0) {
    return null;
  }

  const handleAddToCart = (product: ProductWithExtras) => {
    // Type assertion needed for compatibility with existing cart system
    const productForCart = product as unknown;
    addToCart(productForCart as never, 1, 'M', 'Sin color');
  };

  const comparisonFeatures = [
    { key: 'price', label: 'Precio', format: (value: number) => `$${value}` },
    { key: 'category', label: 'Categoría' },
    { key: 'brand', label: 'Marca' },
    { key: 'rating', label: 'Valoración', format: (value: number) => `${value}/5` },
    { key: 'stock', label: 'Stock' },
    { key: 'sizes', label: 'Tallas', format: (value: string[]) => value?.join(', ') || 'N/A' },
    { key: 'colors', label: 'Colores', format: (value: string[]) => value?.join(', ') || 'N/A' },
    { key: 'material', label: 'Material' },
    { key: 'onSale', label: 'En Oferta', format: (value: boolean) => value ? 'Sí' : 'No' },
  ];

  return (
    <>
      {/* Floating Comparison Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg flex items-center gap-2"
        >
          Comparar ({comparisonItems.length})
        </Button>
      </div>

      {/* Comparison Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="surface rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted">
              <h2 className="text-2xl font-bold">Comparar Productos</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearComparison}>
                  Limpiar Todo
                </Button>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <table className="w-full">
                <thead className="sticky top-0 surface border-b border-muted">
                  <tr>
                    <th className="text-left p-4 font-medium w-32">Característica</th>
                    {comparisonItems.map((product) => (
                      <th key={product.id} className="text-center p-4 min-w-64">
                        <div className="space-y-3">
                          {/* Product Image */}
                          <div className="relative">
                            <OptimizedImage
                              src={product.images[0]}
                              alt={product.name}
                              width={200}
                              height={200}
                              className="rounded-lg mx-auto"
                            />
                            <button
                              onClick={() => removeFromComparison(product.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Product Name */}
                          <div>
                            <Link 
                              href={`/productos/${product.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {product.name}
                            </Link>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleAddToCart(product as unknown as ProductWithExtras)}
                              className="w-full"
                              size="sm"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Añadir al Carrito
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                addToWishlist({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.images?.[0] ?? '',
                                })
                              }
                              disabled={isInWishlist(product.id)}
                              className="w-full"
                              size="sm"
                            >
                              <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                              {isInWishlist(product.id) ? 'En Favoritos' : 'Añadir a Favoritos'}
                            </Button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.key} className={index % 2 === 0 ? 'surface' : ''}>
                      <td className="p-4 font-medium border-r border-muted">
                        {feature.label}
                      </td>
                      {comparisonItems.map((product) => {
                        const value = (product as unknown as Record<string, unknown>)[feature.key];
                        const displayValue = feature.format ? (feature.format as (v: unknown) => unknown)(value) : String(value || 'N/A');
                        
                        return (
                          <td key={product.id} className="p-4 text-center">
                            {feature.key === 'rating' && value ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= Number(value || 0) ? 'text-warning fill-current' : 'muted'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm muted">({String(value || '')})</span>
                              </div>
                            ) : feature.key === 'onSale' && value ? (
                              <Badge variant="success">En Oferta</Badge>
                            ) : feature.key === 'stock' ? (
                              <Badge variant={Number(value || 0) > 0 ? 'success' : 'error'}>
                                {Number(value || 0) > 0 ? `${value} disponibles` : 'Agotado'}
                              </Badge>
                            ) : feature.key === 'price' ? (
                              <div className="space-y-1">
                                <div className="text-lg font-bold text-primary">
                                  ${product.price}
                                </div>
                                {Boolean((product as unknown as Record<string, unknown>).originalPrice && Number((product as unknown as Record<string, unknown>).originalPrice || 0) > product.price) && (
                                  <div className="text-sm muted line-through">
                                    ${String((product as unknown as Record<string, unknown>).originalPrice || '')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span>{String(displayValue)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-muted flex justify-end">
              <Button onClick={() => setIsOpen(false)}>
                Cerrar Comparación
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Comparison toggle button for product cards
export function ComparisonToggle({ product }: { product: ProductWithExtras }) {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(product.id);

  const handleToggle = () => {
    if (inComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product as never);
    }
  };

  return (
    <Button
      variant={inComparison ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="w-full"
    >
      {inComparison ? 'Quitar de Comparación' : 'Comparar'}
    </Button>
  );
}
