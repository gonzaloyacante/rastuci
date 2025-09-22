import React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required = false,
  className,
  children,
  helpText,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>

      {children}

      {helpText && <p className="text-sm muted">{helpText}</p>}

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
};

// Componente para campos de texto
interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "url";
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required = false,
  disabled = false,
  className,
  helpText,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      className={className}
      helpText={helpText}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border border-muted rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:surface-secondary disabled:cursor-not-allowed",
          error && "border-error focus:ring-error focus:border-error"
        )}
      />
    </FormField>
  );
};

// Componente para campos de textarea
interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required = false,
  disabled = false,
  className,
  helpText,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      className={className}
      helpText={helpText}>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border border-muted rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:surface-secondary disabled:cursor-not-allowed resize-vertical",
          error && "border-error focus:ring-error focus:border-error"
        )}
      />
    </FormField>
  );
};

// Componente para campos de selección
interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  className,
  helpText,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      className={className}
      helpText={helpText}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border border-muted rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:surface-secondary disabled:cursor-not-allowed",
          error && "border-error focus:ring-error focus:border-error"
        )}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

// Componente para campos de checkbox
interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  error,
  disabled = false,
  className,
  helpText,
}) => {
  return (
    <FormField
      label=""
      name={name}
      error={error}
      className={className}
      helpText={helpText}>
      <div className="flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={cn(
            "h-4 w-4 text-primary focus:ring-primary border-muted rounded disabled:surface-secondary disabled:cursor-not-allowed",
            error && "border-error"
          )}
        />
        <label htmlFor={name} className="ml-2 block text-sm text-primary">
          {label}
        </label>
      </div>
    </FormField>
  );
};

// Componente para campos de radio
interface RadioFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  disabled = false,
  className,
  helpText,
}) => {
  return (
    <FormField
      label={label}
      name={name}
      error={error}
      className={className}
      helpText={helpText}>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={cn(
                "h-4 w-4 text-primary focus:ring-primary border-muted disabled:surface-secondary disabled:cursor-not-allowed",
                error && "border-error"
              )}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-2 block text-sm text-primary">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FormField>
  );
};
