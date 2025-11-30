"use client";

import { logger } from "@/lib/logger";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: "ADD_TO_WISHLIST"; payload: Omit<WishlistItem, "addedAt"> }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] };

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, "addedAt">) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  getWishlistCount: () => number;
  isLoaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

function wishlistReducer(
  state: WishlistState,
  action: WishlistAction
): WishlistState {
  switch (action.type) {
    case "ADD_TO_WISHLIST": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return state; // Item already in wishlist
      }

      const newItem: WishlistItem = {
        ...action.payload,
        addedAt: new Date().toISOString(),
      };

      return {
        ...state,
        items: [...state.items, newItem],
      };
    }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
      };

    case "LOAD_WISHLIST":
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
}

const initialState: WishlistState = {
  items: [],
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("rastuci-wishlist");
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: "LOAD_WISHLIST", payload: items });
        }
      }
    } catch (error) {
      logger.error("Error loading wishlist from localStorage", { error });
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load
    try {
      localStorage.setItem("rastuci-wishlist", JSON.stringify(state.items));
    } catch (error) {
      logger.error("Error saving wishlist to localStorage", { error });
    }
  }, [state.items, isLoaded]);

  const addToWishlist = (item: Omit<WishlistItem, "addedAt">) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: item });
  };

  const removeFromWishlist = (id: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const isInWishlist = (id: string) => {
    return state.items.some((item) => item.id === id);
  };

  const getWishlistCount = () => {
    return state.items.length;
  };

  const value: WishlistContextType = {
    wishlistItems: state.items,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    isLoaded,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

const _defaultWishlist: WishlistContextType = {
  wishlistItems: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  clearWishlist: () => {},
  isInWishlist: () => false,
  getWishlistCount: () => 0,
  isLoaded: false,
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  return context === undefined ? _defaultWishlist : context;
}

export default WishlistProvider;
