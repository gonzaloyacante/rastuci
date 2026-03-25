"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

interface DynamicTagsProps {
  items: string[];
  className?: string; // Additional classes for the container
  itemClassName?: string; // Classes for individual tags
  badgeClassName?: string; // Classes for the +N badge
}

// ============================================================================
// Module-level helper: pure DOM measurement, no React state dependency
// ============================================================================
function computeVisibleCount(
  container: HTMLElement,
  items: string[],
  itemClassName: string,
  badgeClassName: string
): number {
  const containerWidth = container.clientWidth;
  if (containerWidth === 0) return items.length;

  const tempContainer = document.createElement("div");
  Object.assign(tempContainer.style, {
    visibility: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    display: "flex",
    gap: "4px",
    fontSize: window.getComputedStyle(container).fontSize,
    fontFamily: window.getComputedStyle(container).fontFamily,
    fontWeight: window.getComputedStyle(container).fontWeight,
    letterSpacing: window.getComputedStyle(container).letterSpacing,
  });
  document.body.appendChild(tempContainer);

  try {
    const badgeNode = document.createElement("span");
    badgeNode.className = badgeClassName;
    badgeNode.textContent = "+99";
    tempContainer.appendChild(badgeNode);
    const badgeWidth = badgeNode.offsetWidth;
    tempContainer.removeChild(badgeNode);

    const GAP = 4;
    const itemWidths = items.map((item) => {
      const node = document.createElement("span");
      node.className = itemClassName;
      node.textContent = item;
      tempContainer.appendChild(node);
      const width = node.offsetWidth;
      tempContainer.removeChild(node);
      return width;
    });

    const totalWidth = itemWidths.reduce(
      (acc, w, i) => acc + w + (i > 0 ? GAP : 0),
      0
    );
    if (totalWidth <= containerWidth) return items.length;

    let currentWidth = 0;
    let count = 0;
    for (const w of itemWidths) {
      const cost = w + (count > 0 ? GAP : 0);
      if (currentWidth + cost + GAP + badgeWidth <= containerWidth) {
        currentWidth += cost;
        count++;
      } else {
        break;
      }
    }
    return Math.max(0, count);
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

export const DynamicTags = ({
  items,
  className = "",
  itemClassName = "chip whitespace-nowrap shrink-0",
  badgeClassName = "chip whitespace-nowrap shrink-0 bg-neutral-100 text-neutral-600 border-neutral-200",
}: DynamicTagsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [isCalculated, setIsCalculated] = useState(false);

  useLayoutEffect(() => {
    // If no items, nothing to calculate
    if (!items || items.length === 0) {
      setVisibleCount(0);
      setIsCalculated(true);
      return;
    }

    const calculateVisibleTags = () => {
      const container = containerRef.current;
      if (!container) return;
      const count = computeVisibleCount(
        container,
        items,
        itemClassName,
        badgeClassName
      );
      setVisibleCount(count);
      setIsCalculated(true);
    };

    // Calculate immediately
    calculateVisibleTags();

    // Recalculate on resize
    const observer = new ResizeObserver(() => {
      calculateVisibleTags();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [items, itemClassName, badgeClassName]);

  return (
    <div
      ref={containerRef}
      className={`flex gap-1 overflow-hidden h-6 items-center w-full transition-opacity duration-200 ${className}`}
      style={{ opacity: isCalculated ? 1 : 0 }}
    >
      {items.slice(0, visibleCount).map((item, idx) => (
        <span key={idx} className={itemClassName}>
          {item}
        </span>
      ))}
      {items.length > visibleCount && (
        <span className={badgeClassName}>+{items.length - visibleCount}</span>
      )}
    </div>
  );
};
