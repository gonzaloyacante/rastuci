"use client";

import { Pagination as UIPagination } from "@/components/ui/Pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <UIPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showFirstLast={totalPages > 5}
        maxVisiblePages={5}
      />
    </div>
  );
}
