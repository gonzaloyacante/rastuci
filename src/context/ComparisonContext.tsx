"use client";

import { logger } from "@/lib/logger";
import { Product } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ComparisonContextType {
  comparisonItems: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  maxItems: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(
  undefined
);

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}

interface ComparisonProviderProps {
  children: React.ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [comparisonItems, setComparisonItems] = useState<Product[]>([]);
  const maxItems = 4;

  // Load comparison items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("comparison-items");
    if (savedItems) {
      try {
        setComparisonItems(JSON.parse(savedItems));
      } catch (error) {
        logger.error("Error loading comparison items", { error });
      }
    }
  }, []);

  // Save to localStorage whenever comparison items change
  useEffect(() => {
    localStorage.setItem("comparison-items", JSON.stringify(comparisonItems));
  }, [comparisonItems]);

  const addToComparison = (product: Product) => {
    if (comparisonItems.length >= maxItems) {
      toast.error(`Solo puedes comparar hasta ${maxItems} productos`);
      return;
    }

    if (isInComparison(product.id)) {
      toast.error("Este producto ya está en la comparación");
      return;
    }

    setComparisonItems((prev) => [...prev, product]);
    toast.success("Producto añadido a la comparación");
  };

  const removeFromComparison = (productId: string) => {
    setComparisonItems((prev) => prev.filter((item) => item.id !== productId));
    toast.success("Producto eliminado de la comparación");
  };

  const clearComparison = () => {
    setComparisonItems([]);
    toast.success("Comparación limpiada");
  };

  const isInComparison = (productId: string) => {
    return comparisonItems.some((item) => item.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonItems,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        maxItems,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}
