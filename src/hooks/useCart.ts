import { useState, useEffect } from "react";
import { CartItem, Product } from "@/types";

const CART_STORAGE_KEY = "rastuci_cart";

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Agregar producto al carrito
  const addItem = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        // Si el producto ya está en el carrito, actualizar cantidad
        return currentItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo
        return [
          ...currentItems,
          {
            productId: product.id,
            product,
            quantity,
          },
        ];
      }
    });
  };

  // Actualizar cantidad de un item
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remover item del carrito
  const removeItem = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
  };

  // Calcular total
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Calcular cantidad total de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  // Verificar si un producto está en el carrito
  const isInCart = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  // Obtener cantidad de un producto específico
  const getQuantity = (productId: string) => {
    const item = items.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    itemCount,
    isInCart,
    getQuantity,
    isLoaded,
  };
};
