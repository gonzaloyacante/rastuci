"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModernDashboardLayoutProps {
  children: ReactNode;
}

export default function ModernDashboardLayout({ children }: ModernDashboardLayoutProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen surface p-4 md:p-8 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-10 w-full overflow-x-hidden">
        {/* Animated Background Gradient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <motion.div variants={itemVariants} className="relative z-10">
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}