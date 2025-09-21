/**
 * Panel Component - Consistent flat design system
 * 
 * A flexible, themeable panel component that maintains visual consistency
 * across the entire application with a modern, flat design aesthetic.
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
  
  // Visual variants
  variant?: 'default' | 'subtle' | 'ghost' | 'solid' | 'glass';
  
  // Semantic variants  
  intent?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  
  // Size presets
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Shape
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Interaction states
  hoverable?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  
  // Additional props
  as?: 'div' | 'section' | 'article' | 'aside' | 'main';
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-transparent",
  subtle: "bg-transparent",
  ghost: "bg-transparent",
  solid: "border dark:border-slate-700 border-gray-200",
  glass: "bg-transparent"
};

const intentStyles = {
  neutral: "",
  primary: "dark:bg-blue-900/30 bg-blue-50/70",
  success: "dark:bg-green-900/30 bg-green-50/70",
  warning: "dark:bg-yellow-900/30 bg-yellow-50/70",
  danger: "dark:bg-red-900/30 bg-red-50/70",
  info: "dark:bg-cyan-900/30 bg-cyan-50/70"
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8"
};

const roundedStyles = {
  none: "",
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full"
};

export function Panel({
  children,
  className,
  variant = 'default',
  intent = 'neutral',
  padding = 'none',
  rounded = 'none',
  hoverable = false,
  clickable = false,
  disabled = false,
  as: Component = 'div',
  onClick,
  ...props
}: PanelProps) {
  const baseStyles = "transition-all duration-200";
  
  const interactionStyles = cn(
    hoverable && !disabled && "dark:hover:bg-slate-700/50 hover:bg-gray-100",
    clickable && !disabled && "cursor-pointer active:scale-[0.99]",
    disabled && "opacity-50 cursor-not-allowed"
  );
  
  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant],
        intent !== 'neutral' && intentStyles[intent],
        paddingStyles[padding],
        roundedStyles[rounded],
        interactionStyles,
        className
      )}
      onClick={!disabled ? onClick : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

// Specialized panel variants for common use cases
export function Card({ className, children, ...props }: Omit<PanelProps, 'variant'>) {
  return (
    <Panel variant="ghost" rounded="none" padding="none" {...props} className={className}>
      {children}
    </Panel>
  );
}

export function Section({ className, children, ...props }: Omit<PanelProps, 'variant'>) {
  return (
    <Panel 
      as="section" 
      variant="subtle" 
      rounded="lg" 
      padding="lg" 
      {...props} 
      className={className}
    >
      {children}
    </Panel>
  );
}

interface AlertProps extends Omit<PanelProps, 'variant' | 'intent'> {
  intent?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  icon?: boolean;
}

const alertIcons = {
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const alertColors = {
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-warning',
  error: 'text-danger',
  success: 'text-success',
};

const alertBackgrounds = {
  info: 'bg-alert-info',
  warning: 'bg-alert-warning',
  error: 'bg-alert-danger',
  success: 'bg-alert-success',
};

export function Alert({ 
  className, 
  children, 
  intent = 'info', 
  title,
  icon = true,
  ...props 
}: AlertProps) {
  return (
    <div 
      className={cn(
        "rounded-lg p-4 flex gap-3",
        alertBackgrounds[intent],
        className
      )}
      {...props}
    >
      {icon && (
        <span className={alertColors[intent]}>
          {alertIcons[intent]}
        </span>
      )}
      <div className="flex-1">
        {title && (
          <h3 className={cn("font-semibold mb-1", alertColors[intent])}>
            {title}
          </h3>
        )}
        <div className={cn(
          "text-sm",
          title ? "dark:text-gray-300 text-gray-700" : alertColors[intent]
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function GlassCard({ className, children, ...props }: Omit<PanelProps, 'variant'>) {
  return (
    <Panel 
      variant="glass" 
      rounded="xl" 
      padding="lg" 
      hoverable
      {...props} 
      className={className}
    >
      {children}
    </Panel>
  );
}