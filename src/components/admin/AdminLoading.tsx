import React from "react";

interface AdminLoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullPage?: boolean;
  /** Optional skeleton component to render instead of spinner */
  skeleton?: React.ReactNode;
}

/**
 * AdminLoading - Loading component for admin pages
 * @deprecated Use skeleton components from @/components/admin/skeletons instead
 * This component is kept for backwards compatibility but new pages should use skeletons directly
 */
export const AdminLoading: React.FC<AdminLoadingProps> = ({
  className = "",
  fullPage = false,
  skeleton,
}) => {
  // If a skeleton is provided, render it
  if (skeleton) {
    return <>{skeleton}</>;
  }

  // Default: render a minimal skeleton placeholder
  const getContainerClasses = () => {
    if (fullPage) {
      return "fixed inset-0 surface bg-opacity-75 flex justify-center items-center z-50";
    }
    return "space-y-6";
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg surface-secondary animate-pulse" />
        <div className="h-4 w-64 rounded surface-secondary animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl surface-secondary animate-pulse"
          />
        ))}
      </div>

      {/* Additional content skeleton */}
      <div className="h-64 rounded-xl surface-secondary animate-pulse" />
    </div>
  );
};
