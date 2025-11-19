"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartWidget() {
  const { getItemCount } = useCart();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // simulate async hydration read
    setTimeout(() => {
      setCount(getItemCount());
    }, 0);
  }, [getItemCount]);

  if (count === null) {
    // skeleton for cart button
    return (
      <div className="w-9 h-9 rounded-full bg-muted animate-pulse" aria-hidden="true" />
    );
  }

  return (
    <Link href="/carrito" className="relative p-2 muted hover:text-primary transition-colors" aria-label={`Ver carrito (${count} productos)`}>
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 surface text-primary border border-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
      )}
    </Link>
  );
}
