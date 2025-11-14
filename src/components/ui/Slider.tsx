'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  className = '',
  disabled = false,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(thumb);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;

    if (isDragging === 'min') {
      onValueChange([Math.min(steppedValue, value[1]), value[1]]);
    } else {
      onValueChange([value[0], Math.max(steppedValue, value[0])]);
    }
  }, [isDragging, disabled, min, max, step, onValueChange, value]);

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, value, min, max, step, handleMouseMove]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className={`relative h-2 rounded-full cursor-pointer ${
          disabled ? 'surface-secondary' : 'surface border border-muted'
        }`}
      >
        {/* Active range */}
        <div
          className={`absolute h-full rounded-full ${
            disabled ? 'surface-secondary' : 'bg-primary'
          }`}
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={`absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-pointer ${
            disabled
              ? 'surface-secondary border-muted'
              : 'surface border-primary hover:scale-110 transition-transform'
          } ${isDragging === 'min' ? 'scale-110' : ''}`}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
        />

        {/* Max thumb */}
        <div
          className={`absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-pointer ${
            disabled
              ? 'surface-secondary border-muted'
              : 'surface border-primary hover:scale-110 transition-transform'
          } ${isDragging === 'max' ? 'scale-110' : ''}`}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>

      {/* Value labels */}
      <div className="flex justify-between mt-2 text-sm muted">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
    </div>
  );
}
