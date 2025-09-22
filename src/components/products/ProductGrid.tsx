"use client";

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { LoadingSkeleton, LoadingSpinner } from '../ui/LoadingStates';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Pagination, PaginationInfo } from '../ui/Pagination';
import { Button } from '../ui/Button';
import { Grid, List } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  // Pagination mode
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  // Infinite scroll mode
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  // Display options
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  className?: string;
}

export function ProductGrid({
  products,
  loading = false,
  error = null,
  // Pagination props
  totalPages,
  currentPage,
  onPageChange,
  totalItems,
  itemsPerPage,
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  // Display props
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  className = '',
}: ProductGridProps) {
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>(viewMode);
  
  // Determine if we're using pagination or infinite scroll
  const isPaginationMode = Boolean(totalPages && currentPage && onPageChange);
  const isInfiniteScrollMode = Boolean(hasMore && onLoadMore);

  // Infinite scroll hook
  const { isFetching, lastElementRef } = useInfiniteScroll(
    onLoadMore || (() => Promise.resolve()),
    hasMore,
    { enabled: isInfiniteScrollMode }
  );

  const currentViewMode = onViewModeChange ? viewMode : localViewMode;

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setLocalViewMode(mode);
    }
  };

  const gridClasses = useMemo(() => {
    if (currentViewMode === 'list') {
      return 'flex flex-col space-y-4';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
  }, [currentViewMode]);

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full surface flex items-center justify-center">
          <svg
            className="w-8 h-8 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Error al cargar productos</h3>
        <p className="muted mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  // Empty state
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="surface rounded-lg border border-muted overflow-hidden animate-pulse product-card">
            <div className="aspect-square bg-muted"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full surface flex items-center justify-center">
          <svg
            className="w-8 h-8 muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
        <p className="muted">Intenta ajustar los filtros de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with view toggle and pagination info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Pagination info */}
        {isPaginationMode && totalItems && itemsPerPage && currentPage && (
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages!}
            totalItems={totalItems}
            startItem={Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
            endItem={Math.min(currentPage * itemsPerPage, totalItems)}
          />
        )}

        {/* View toggle */}
        {showViewToggle && (
          <div className="flex items-center gap-2">
            <span className="text-sm muted">Vista:</span>
            <div className="flex rounded-lg border border-muted overflow-hidden">
              <Button
                variant={currentViewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="rounded-none border-0"
                aria-label="Vista en cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={currentViewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="rounded-none border-0"
                aria-label="Vista en lista"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Products grid/list */}
      <div className={gridClasses}>
        {/* Loading skeletons */}
        {loading && products.length === 0 && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <LoadingSkeleton className="aspect-square rounded-lg" />
                <LoadingSkeleton lines={2} />
              </div>
            ))}
          </>
        )}

        {/* Product cards */}
        {products.map((product, index) => {
          const isLast = index === products.length - 1;
          
          return (
            <div
              key={product.id}
              ref={isInfiniteScrollMode && isLast ? lastElementRef : undefined}
            >
              <ProductCard
                product={product}
                viewMode={currentViewMode}
                loading={loading && index >= products.length - 4} // Show loading on last 4 items
              />
            </div>
          );
        })}
      </div>

      {/* Infinite scroll loading */}
      {isInfiniteScrollMode && isFetching && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Pagination */}
      {isPaginationMode && totalPages && currentPage && onPageChange && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* No more items message for infinite scroll */}
      {isInfiniteScrollMode && !hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="muted">Has visto todos los productos disponibles</p>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
