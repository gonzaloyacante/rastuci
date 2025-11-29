"use client";

import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface WishlistWidgetProps {
  mobile?: boolean;
}

export default function WishlistWidget({
  mobile = false,
}: WishlistWidgetProps) {
  const { getWishlistCount } = useWishlist();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setCount(getWishlistCount());
    }, 0);
  }, [getWishlistCount]);

  if (count === null) {
    const skeletonSize = mobile ? "w-8 h-8" : "w-9 h-9";
    return (
      <div
        className={`${skeletonSize} rounded-full bg-muted animate-pulse`}
        aria-hidden="true"
      />
    );
  }

  const badgeSize = mobile ? "w-4 h-4 text-[10px]" : "w-5 h-5";

  return (
    <Link
      href="/favoritos"
      className="relative p-2 muted hover:text-primary transition-colors"
      aria-label={`Ver favoritos (${count} productos)`}
    >
      <Heart className="w-5 h-5" />
      {count > 0 && (
        <span
          className={`absolute -top-1 -right-1 surface text-primary border border-primary text-xs rounded-full flex items-center justify-center ${badgeSize}`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
