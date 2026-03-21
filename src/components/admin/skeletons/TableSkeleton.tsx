"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export const TableSkeleton = ({
  columns = 5,
  rows = 8,
  showHeader = true,
  showActions = true,
}: TableSkeletonProps) => (
  <div className="surface rounded-xl border border-muted overflow-hidden">
    {showHeader && (
      <div className="flex items-center justify-between p-4 border-b border-muted">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" rounded="md" />
          <Skeleton className="h-9 w-32" rounded="md" />
        </div>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-muted">
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
            {showActions && (
              <th className="px-4 py-3 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-muted last:border-0">
              {[...Array(columns)].map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton
                    className={cn("h-4", colIdx === 0 ? "w-32" : "w-20")}
                  />
                </td>
              ))}
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" rounded="md" />
                    <Skeleton className="h-8 w-8" rounded="md" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Pagination */}
    <div className="flex items-center justify-between p-4 border-t border-muted">
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
      </div>
    </div>
  </div>
);
