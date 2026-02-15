import { Variants } from "framer-motion";

// ============================================================================
// DURATIONS & EASINGS
// ============================================================================

export const DURATION = {
  FAST: 0.15,
  NORMAL: 0.2,
  SLOW: 0.3,
  VERY_SLOW: 0.5,
} as const;

export const EASE = {
  DEFAULT: "easeInOut",
  OUT: "easeOut",
  IN: "easeIn",
} as const;

export const SPRING = {
  DEFAULT: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  BOUNCY: {
    type: "spring",
    stiffness: 400,
    damping: 20,
  },
} as const;

// ============================================================================
// VARIANTS
// ============================================================================

export const FADE_IN: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const FADE_IN_UP: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const FADE_IN_DOWN: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const SLIDE_IN_RIGHT: Variants = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};

export const SLIDE_IN_LEFT: Variants = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
};

export const SCALE_IN: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ============================================================================
// UTILS
// ============================================================================

/**
 * Returns empty variants if reduced motion is enabled, otherwise returns the requested variants.
 */
export const getAccessibleVariants = (
  variants: Variants,
  reduceMotion: boolean
): Variants => {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, x: 0, y: 0, scale: 1 },
      animate: { opacity: 1, x: 0, y: 0, scale: 1 },
      exit: { opacity: 1, x: 0, y: 0, scale: 1 },
    };
  }
  return variants;
};
