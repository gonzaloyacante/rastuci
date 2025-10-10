"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutTransitionsProps {
  children: React.ReactNode;
  currentStep: number;
  direction?: 'forward' | 'backward';
}

// Variantes de animación para los pasos
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

// Componente de transición suave entre pasos
export function StepTransition({ 
  children, 
  currentStep, 
  direction = 'forward' 
}: CheckoutTransitionsProps) {
  const [prevStep, setPrevStep] = useState(currentStep);

  const directionValue =
    currentStep > prevStep
      ? 1
      : currentStep < prevStep
        ? -1
        : direction === 'forward'
          ? 1
          : -1;

  useEffect(() => {
    setPrevStep(currentStep);
  }, [currentStep]);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" custom={directionValue}>
        <motion.div
          key={currentStep}
          custom={directionValue}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Componente de carga con skeleton
interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ lines = 3, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div 
            className="h-4 surface-secondary rounded"
            style={{ 
              width: `${Math.random() * 40 + 60}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Componente de progreso con animación
interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'error';
  animated?: boolean;
}

export function ProgressBar({ 
  progress, 
  showPercentage = false, 
  color = 'primary',
  animated = true 
}: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    error: 'bg-error'
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Progreso</span>
        {showPercentage && (
          <span className="text-sm muted">{Math.round(animatedProgress)}%</span>
        )}
      </div>
      <div className="w-full surface-secondary rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${animatedProgress}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut" 
          }}
        />
      </div>
    </div>
  );
}

// Componente de notificación flotante
interface FloatingNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function FloatingNotification({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000
}: FloatingNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeStyles = {
    success: 'surface-secondary border-success text-success',
    error: 'surface-secondary border-error text-error',
    info: 'surface-secondary border-primary text-primary'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg max-w-sm ${typeStyles[type]}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-3 text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente de pulso para elementos que requieren atención
interface PulseHighlightProps {
  children: React.ReactNode;
  isActive?: boolean;
  color?: 'primary' | 'error' | 'success';
}

export function PulseHighlight({ 
  children, 
  isActive = false, 
  color = 'primary' 
}: PulseHighlightProps) {
  const pulseColors = {
    primary: 'ring-primary/20',
    error: 'ring-error/20',
    success: 'ring-success/20'
  };

  return (
    <motion.div
      animate={isActive ? {
        boxShadow: [
          `0 0 0 0px rgba(var(--${color}), 0.4)`,
          `0 0 0 10px rgba(var(--${color}), 0)`,
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: isActive ? Infinity : 0,
        ease: "easeOut"
      }}
      className={isActive ? `ring-4 ${pulseColors[color]} rounded-lg` : ''}
    >
      {children}
    </motion.div>
  );
}

// Componente de contador animado
interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 1000, 
  prefix = '', 
  suffix = '' 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const startTime = Date.now();
    const difference = to - from;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = from + (difference * easeOut);
      
      setCount(Math.round(currentCount));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    updateCount();
  }, [from, to, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Hook para animaciones de entrada escalonada
export function useStaggeredAnimation(itemCount: number, delay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay);
      
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [itemCount, delay]);

  return visibleItems;
}
