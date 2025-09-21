import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * FormSection Component
 *
 * Standardized container for form content with consistent width and spacing.
 * Use this for all settings, profile, and form-based content to ensure consistency.
 */
export function FormSection({
  children,
  title,
  description,
  icon,
  className
}: FormSectionProps) {
  return (
    <div className={cn("max-w-3xl space-y-6", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2 flex items-center gap-2">
              {icon}
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm dark:text-gray-400 text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * FormGroup Component
 *
 * Groups related form fields together with optional label.
 */
interface FormGroupProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function FormGroup({ children, label, className }: FormGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <h4 className="text-base font-medium dark:text-gray-200 text-gray-800">
          {label}
        </h4>
      )}
      {children}
    </div>
  );
}

/**
 * FormField Component
 *
 * Individual form field container with label and optional help text.
 */
interface FormFieldProps {
  children: ReactNode;
  label: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  children,
  label,
  helpText,
  required,
  className
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="mt-1 text-xs dark:text-gray-500 text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}