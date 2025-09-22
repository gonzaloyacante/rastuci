'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    className = '',
    id,
    name,
    ...props 
  }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all
            ${checked 
              ? 'bg-primary border-primary text-white' 
              : 'surface border-muted hover:border-primary'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          onClick={() => !disabled && onCheckedChange?.(!checked)}
        >
          {checked && <Check className="w-3 h-3" />}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
