import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 surface-secondary rounded',
            i > 0 && 'mt-2',
            i === lines - 1 && lines > 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('surface p-6 rounded-lg border border-muted animate-pulse', className)}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 surface-secondary rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 surface-secondary rounded w-3/4" />
          <div className="h-3 surface-secondary rounded w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 surface-secondary rounded" />
        <div className="h-3 surface-secondary rounded w-5/6" />
      </div>
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ title = 'Cargando...', description }: LoadingPageProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {description && (
          <p className="muted max-w-md">{description}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function LoadingButton({ children, loading, className, ...props }: LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 disabled:opacity-60',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
