"use client";

import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  const { show } = useToast();
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
      show({
        type: "error",
        message: `Solo puedes comparar hasta ${maxItems} productos`,
      });
      return;
    }

    if (isInComparison(product.id)) {
      show({
        type: "error",
        message: "Este producto ya está en la comparación",
      });
      return;
    }

    setComparisonItems((prev) => [...prev, product]);
    show({ type: "success", message: "Producto añadido a la comparación" });
  };

  const removeFromComparison = (productId: string) => {
    setComparisonItems((prev) => prev.filter((item) => item.id !== productId));
    show({ type: "success", message: "Producto eliminado de la comparación" });
  };

  const clearComparison = () => {
    setComparisonItems([]);
    show({ type: "success", message: "Comparación limpiada" });
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
