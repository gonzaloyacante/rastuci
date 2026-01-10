"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

interface DynamicTagsProps {
  items: string[];
  className?: string; // Additional classes for the container
  itemClassName?: string; // Classes for individual tags
  badgeClassName?: string; // Classes for the +N badge
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

      const containerWidth = container.clientWidth;
      if (containerWidth === 0) return; // Hidden or unmounted

      // Create a temporary hidden container to measure items accurately
      const tempContainer = document.createElement("div");
      Object.assign(tempContainer.style, {
        visibility: "hidden",
        position: "absolute",
        whiteSpace: "nowrap",
        display: "flex",
        gap: "4px", // Default Tailwind gap-1 is 0.25rem = 4px. Adjust if className changes gap.
        // Copy font styles from the real container to ensure accurate measurement
        fontSize: window.getComputedStyle(container).fontSize,
        fontFamily: window.getComputedStyle(container).fontFamily,
        fontWeight: window.getComputedStyle(container).fontWeight,
        letterSpacing: window.getComputedStyle(container).letterSpacing,
      });

      document.body.appendChild(tempContainer);

      try {
        // Measure the "+99" badge as a safe max width estimate
        const badgeNode = document.createElement("span");
        badgeNode.className = badgeClassName; // Use actual badge classes
        badgeNode.textContent = "+99";
        tempContainer.appendChild(badgeNode);
        const badgeWidth = badgeNode.offsetWidth;
        tempContainer.removeChild(badgeNode);

        // Measure all individual items
        const itemWidths = items.map((item) => {
          const node = document.createElement("span");
          node.className = itemClassName; // Use actual item classes
          node.textContent = item;
          tempContainer.appendChild(node);
          const width = node.offsetWidth;
          tempContainer.removeChild(node);
          return width;
        });

        const GAP = 4; // Assuming gap-1
        let currentWidth = 0;

        // First pass: Try to fit ALL items
        for (const w of itemWidths) {
          currentWidth += w + GAP;
        }
        if (items.length > 0) currentWidth -= GAP; // Remove trailing gap

        if (currentWidth <= containerWidth) {
          setVisibleCount(items.length);
        } else {
          // Not all fit. We need to find how many fit along with the badge.
          // Reset and iterate
          currentWidth = 0;
          let count = 0;

          for (let i = 0; i < itemWidths.length; i++) {
            const w = itemWidths[i];
            // The added width if we include this item
            const cost = w + (count > 0 ? GAP : 0);

            // Check if adding this item leaves enough space for the badge?
            // Specifically: currentWidth + cost + GAP + badgeWidth <= containerWidth
            // Note: If this is the LAST item that fits, we might not need the badge...
            // but we established earlier that NOT ALL fit. So we definitely need the badge if we truncate.

            if (currentWidth + cost + GAP + badgeWidth <= containerWidth) {
              currentWidth += cost;
              count++;
            } else {
              // Can't fit this item + badge. Stop.
              break;
            }
          }
          setVisibleCount(Math.max(0, count));
        }
      } finally {
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
        setIsCalculated(true);
      }
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
