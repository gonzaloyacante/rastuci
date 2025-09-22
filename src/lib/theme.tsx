"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system'
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || defaultTheme;
    setTheme(initialTheme);
  }, [defaultTheme]);

  // Update color scheme when theme changes
  useEffect(() => {
    const updateColorScheme = () => {
      const root = document.documentElement;

      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newColorScheme: ColorScheme = systemPrefersDark ? 'dark' : 'light';
        setColorScheme(newColorScheme);

        // Apply system theme
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else {
        setColorScheme(theme);
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    updateColorScheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateColorScheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    colorScheme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme toggle button component
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'system':
        return (
          <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Modo claro';
      case 'dark': return 'Modo oscuro';
      case 'system': return 'Modo sistema';
    }
  };

  return (
    <button
      onClick={handleThemeChange}
      className={`
        ${sizeClasses[size]}
        p-2 rounded-lg surface hover:surface-secondary
        muted transition-colors duration-200
        ${className}
      `}
      title={`Cambiar a ${getThemeLabel()}`}
      aria-label={`Cambiar tema: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {getThemeLabel()}
        </span>
      )}
    </button>
  );
};

// Theme-aware wrapper component
interface ThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors ${className}`}>
      {children}
    </div>
  );
};

// Hook for theme-aware styles
export const useThemeStyles = () => {
  const { colorScheme } = useTheme();

  return {
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    theme: colorScheme,
  };
};
