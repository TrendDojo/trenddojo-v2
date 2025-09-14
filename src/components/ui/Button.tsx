"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    
    // Base styles
    const baseStyles = "font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Variant styles matching website colors
    const variantStyles = {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
      secondary: "dark:bg-slate-700/50 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 dark:text-white text-gray-900 focus:ring-slate-500",
      ghost: "bg-transparent dark:hover:bg-slate-700/30 hover:bg-gray-100 dark:text-white text-gray-900 focus:ring-slate-500",
      danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
      success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
    };
    
    // Size styles
    const sizeStyles = {
      sm: "px-3 py-2",
      md: "px-4 py-3",
      lg: "px-6 py-4 text-lg",
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </div>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };