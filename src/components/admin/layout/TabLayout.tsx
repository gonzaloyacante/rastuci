"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function TabLayout({
  tabs,
  activeTab,
  onTabChange,
  children,
}: TabLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, tabs]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="hidden sm:flex absolute left-0 top-0 bottom-0 z-10 items-center justify-center w-10 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent hover:from-[var(--color-surface)] rounded-none p-0"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
        )}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-px no-scrollbar scroll-smooth"
        >
          <div className="flex gap-2 border-b border-muted min-w-max">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                variant="ghost"
                className={`px-4 py-3 sm:py-2 text-sm sm:text-base whitespace-nowrap rounded-t-lg flex items-center gap-2 transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-primary h-auto ${
                  activeTab === tab.id
                    ? "surface-secondary text-primary font-medium border-b-2 border-primary -mb-[2px]"
                    : "text-muted hover:text-primary hover:bg-surface-secondary/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="hidden sm:flex absolute right-0 top-0 bottom-0 z-10 items-center justify-center w-10 bg-gradient-to-l from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent hover:from-[var(--color-surface)] rounded-none p-0"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
