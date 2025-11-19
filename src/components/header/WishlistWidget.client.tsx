"use client";

import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistWidget() {
  const { getWishlistCount } = useWishlist();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setCount(getWishlistCount());
    }, 0);
  }, [getWishlistCount]);

  if (count === null) {
    return <div className="w-9 h-9 rounded-full bg-muted animate-pulse" aria-hidden="true" />;
  }

  return (
    <Link href="/favoritos" className="relative p-2 muted hover:text-primary transition-colors" aria-label={`Ver favoritos (${count} productos)`}>
      <Heart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 surface text-primary border border-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
      )}
    </Link>
  );
}
