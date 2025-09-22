"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    gray: 'muted',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('flex space-x-1', className)} aria-label="Loading">
      <div
        className={cn(
          'bg-current rounded-full animate-bounce',
          sizeClasses[size]
        )}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(
          'bg-current rounded-full animate-bounce',
          sizeClasses[size]
        )}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(
          'bg-current rounded-full animate-bounce',
          sizeClasses[size]
        )}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  animate = true,
}) => {
  return (
    <div
      className={cn(
        'surface-secondary rounded',
        animate && 'animate-pulse',
        className
      )}
      role="presentation"
    />
  );
};

interface CardSkeletonProps {
  lines?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="muted mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  className = '',
  animated = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full surface-secondary rounded-full', sizeClasses[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            sizeClasses[size],
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showPercentage && (
        <div className="text-xs muted mt-1 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  fallback,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const defaultFallback = name ? (
    <span className="font-medium muted">
      {getInitials(name)}
    </span>
  ) : (
    <svg className="w-1/2 h-1/2 muted" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div
      className={cn(
        'rounded-full surface flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

interface BadgeGroupProps {
  badges: Array<{
    label: string;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'xs' | 'sm' | 'md';
  }>;
  className?: string;
  maxVisible?: number;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  badges,
  className = '',
  maxVisible = 3,
}) => {
  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = badges.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {visibleBadges.map((badge, index) => (
        <Badge key={index} variant={badge.variant || 'secondary'} size={badge.size || 'sm'}>
          {badge.label}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline" size="sm">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white surface-inverse rounded shadow-lg whitespace-nowrap',
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 surface-inverse transform rotate-45',
              position === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
              position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
              position === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
              position === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1',
            )}
          />
        </div>
      )}
    </div>
  );
};
