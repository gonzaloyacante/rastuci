"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - half) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      role="navigation"
      aria-label="Paginación"
      className={`flex items-center justify-center space-x-1 ${className}`}
    >
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        className="px-3"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* First page button (if showFirstLast and not already visible) */}
      {showFirstLast && currentPage > 3 && (
        <>
          <Button
            variant={1 === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            aria-label="Ir a la primera página"
            aria-current={1 === currentPage ? "page" : undefined}
          >
            1
          </Button>
          {currentPage > 4 && (
            <span className="px-2 py-1 text-sm muted">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          )}
        </>
      )}

      {/* Visible page numbers */}
      {visiblePages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm muted">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-label={`Ir a la página ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className="min-w-[2.5rem]"
          >
            {page}
          </Button>
        );
      })}

      {/* Last page button (if showFirstLast and not already visible) */}
      {showFirstLast && currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && (
            <span className="px-2 py-1 text-sm muted">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          )}
          <Button
            variant={totalPages === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            aria-label="Ir a la última página"
            aria-current={totalPages === currentPage ? "page" : undefined}
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Página siguiente"
        className="px-3"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
}

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  className?: string;
}

export function PaginationInfo({
  currentPage: _currentPage,
  totalPages: _totalPages,
  totalItems,
  startItem,
  endItem,
  className,
}: PaginationInfoProps) {
  return (
    <div className={`text-sm muted ${className}`}>
      Mostrando {startItem} a {endItem} de {totalItems} resultados
    </div>
  );
}

export default Pagination;
