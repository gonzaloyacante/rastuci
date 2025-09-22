"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getIcon = () => {
    return theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    return theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className="w-9 h-9 p-0"
    >
      {getIcon()}
    </Button>
  );
}

export default ThemeToggle;
