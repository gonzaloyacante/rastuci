import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import useDebounce from "@/hooks/useDebounce";
import { logger } from "@/lib/logger";
import { Product } from "@/types";

export interface SearchSuggestion {
  id: string;
  type: "product" | "category" | "trending" | "recent";
  text: string;
  subtitle?: string;
  image?: string;
  category?: string;
  rating?: number;
  price?: number;
  href?: string;
}

interface UseSmartSearchOptions {
  showTrending?: boolean;
  showRecent?: boolean;
  onSearch?: (query: string) => void;
}

async function fetchSuggestions(
  searchQuery: string
): Promise<SearchSuggestion[]> {
  const productsRes = await fetch(
    `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=3`
  );
  const productsData = await productsRes.json();
  const products: Product[] = productsData.data?.data || [];

  const categoriesRes = await fetch("/api/categories");
  const categoriesData = await categoriesRes.json();
  const categories: { id: string; name: string }[] =
    categoriesData.data?.data || [];

  const suggestionsList: SearchSuggestion[] = [];

  products.forEach((product) => {
    suggestionsList.push({
      id: product.id,
      type: "product",
      text: product.name,
      subtitle: product.categories?.name || "Producto",
      rating: product.rating || undefined,
      price: product.price,
      href: `/productos/${product.id}`,
    });
  });

  const matchingCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  matchingCategories.forEach((cat) => {
    suggestionsList.push({
      id: cat.id,
      type: "category",
      text: cat.name,
      subtitle: "Categoría",
      href: `/productos?category=${cat.id}`,
    });
  });

  return suggestionsList.slice(0, 6);
}

function saveRecentSearches(searches: string[]): void {
  try {
    localStorage.setItem("recentSearches", JSON.stringify(searches));
  } catch {
    // noop — QuotaExceededError possible in iOS private mode
  }
}

export function useSmartSearch({
  showTrending = true,
  showRecent = true,
  onSearch,
}: UseSmartSearchOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  const { data: trendingData } = useSWR(
    "/api/search/trending",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return { trending: [] };
      return res.json();
    }
  );

  const trendingSearches: string[] = useMemo(
    () => trendingData?.data?.trending ?? [],
    [trendingData]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const recent = JSON.parse(
          localStorage.getItem("recentSearches") || "[]"
        );
        setRecentSearches(recent.slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      fetchSuggestions(debouncedQuery)
        .then(setSuggestions)
        .catch((error) => {
          logger.error("Error fetching suggestions", { error });
          setSuggestions([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  const handleSearch = useCallback(
    (searchQuery: string = query) => {
      if (!searchQuery.trim()) return;

      const newRecent = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      saveRecentSearches(newRecent);

      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/productos?buscar=${encodeURIComponent(searchQuery)}`);
      }

      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    [query, recentSearches, onSearch, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const total =
        suggestions.length +
        (showRecent ? recentSearches.length : 0) +
        (showTrending ? trendingSearches.length : 0);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % total);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleEnterKey(
          selectedIndex,
          suggestions,
          recentSearches,
          trendingSearches,
          showRecent,
          showTrending,
          router,
          handleSearch
        );
      }
    },
    [
      isOpen,
      suggestions,
      recentSearches,
      trendingSearches,
      showRecent,
      showTrending,
      selectedIndex,
      router,
      handleSearch,
    ]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const removeRecentSearch = useCallback(
    (searchToRemove: string) => {
      const newRecent = recentSearches.filter((s) => s !== searchToRemove);
      setRecentSearches(newRecent);
      saveRecentSearches(newRecent);
    },
    [recentSearches]
  );

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    isLoading,
    suggestions,
    selectedIndex,
    recentSearches,
    trendingSearches,
    inputRef,
    handleSearch,
    handleKeyDown,
    clearSearch,
    removeRecentSearch,
  };
}

function handleEnterKey(
  selectedIndex: number,
  suggestions: SearchSuggestion[],
  recentSearches: string[],
  trendingSearches: string[],
  showRecent: boolean,
  showTrending: boolean,
  router: ReturnType<typeof useRouter>,
  handleSearch: (q?: string) => void
): void {
  if (selectedIndex < 0) {
    handleSearch();
    return;
  }

  let cursor = 0;

  if (selectedIndex < suggestions.length) {
    const suggestion = suggestions[selectedIndex];
    if (suggestion.href) {
      router.push(suggestion.href);
    } else {
      handleSearch(suggestion.text);
    }
    return;
  }
  cursor += suggestions.length;

  if (showRecent && selectedIndex < cursor + recentSearches.length) {
    handleSearch(recentSearches[selectedIndex - cursor]);
    return;
  }
  cursor += recentSearches.length;

  if (showTrending && selectedIndex < cursor + trendingSearches.length) {
    handleSearch(trendingSearches[selectedIndex - cursor]);
  }
}
