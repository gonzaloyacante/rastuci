'use client';

import { useState, useEffect } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  validation?: z.ZodSchema;
  errors?: FieldErrors;
  register: any;
  realTimeValidation?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  errors,
  register,
  realTimeValidation = true,
  inputProps,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const error = errors?.[name];
  const hasError = (touched && localError) || error;

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (realTimeValidation && touched) {
      // Real-time validation logic would go here
      // For now, just clear local error on change
      setLocalError(null);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        onBlur={handleBlur}
        onChange={handleChange}
        className={hasError ? 'border-error focus:border-error' : ''}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : undefined}
        {...inputProps}
      />
      
      {hasError && (
        <p id={`${name}-error`} className="text-sm text-error" role="alert">
          {(error as any)?.message || localError}
        </p>
      )}
    </div>
  );
}

interface EnhancedFormProps {
  schema: z.ZodSchema<any>;
  onSubmit: (data: any) => Promise<void> | void;
  children: React.ReactNode | ((props: { register: any; errors: any; watch: any }) => React.ReactNode);
  className?: string;
  submitText?: string;
  isLoading?: boolean;
  resetOnSuccess?: boolean;
}

export function EnhancedForm({
  schema,
  onSubmit,
  children,
  className = '',
  submitText = 'Submit',
  isLoading = false,
  resetOnSuccess = false,
}: EnhancedFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  // Watch all form values for real-time validation
  const watchedValues = watch();

  const handleFormSubmit = async (data: any) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      await onSubmit(data);
      
      setSubmitSuccess(true);
      if (resetOnSuccess) {
        reset();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={className} noValidate>
      <div className="space-y-4">
        {typeof children === 'function' 
          ? children({ register, errors, watch: watchedValues })
          : children
        }
        
        {submitError && (
          <div className="p-3 rounded-md bg-error/10 border border-error/20" role="alert">
            <p className="text-sm text-error">{submitError}</p>
          </div>
        )}
        
        {submitSuccess && (
          <div className="p-3 rounded-md bg-success/10 border border-success/20" role="alert">
            <p className="text-sm text-success">Form submitted successfully!</p>
          </div>
        )}
        
        <Button
          type="submit"
          disabled={isSubmitting || isLoading || !isValid}
          className="w-full"
        >
          {isSubmitting || isLoading ? 'Submitting...' : submitText}
        </Button>
      </div>
    </form>
  );
}

// Pre-built form schemas
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

export const userFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

// Example usage component
export function ContactForm() {
  const handleSubmit = async (data: z.infer<typeof contactFormSchema>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Contact form submitted:', data);
  };

  return (
    <EnhancedForm
      schema={contactFormSchema}
      onSubmit={handleSubmit}
      submitText="Send Message"
      resetOnSuccess={true}
    >
      {({ register, errors }) => (
        <>
          <FormField
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            required
            register={register}
            errors={errors}
          />
          
          <FormField
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            required
            register={register}
            errors={errors}
          />
          
          <FormField
            name="subject"
            label="Subject"
            placeholder="What is this about?"
            required
            register={register}
            errors={errors}
          />
          
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">
              Message <span className="text-error">*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Enter your message"
              {...register('message')}
              className={`w-full px-3 py-2 border rounded-md surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.message ? 'border-error' : 'border-muted'
              }`}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message && (
              <p className="text-sm text-error" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>
        </>
      )}
    </EnhancedForm>
  );
}
