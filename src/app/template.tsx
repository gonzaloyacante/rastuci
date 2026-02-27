"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE, FADE_IN_UP } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // If user prefers reduced motion, disable animations
  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      variants={FADE_IN_UP}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: DURATION.NORMAL,
        ease: EASE.DEFAULT,
      }}
    >
      {children}
    </motion.div>
  );
}
