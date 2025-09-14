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
  default: "bg-slate-800/50 dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm",
  subtle: "bg-slate-800/30 dark:bg-slate-800/30 bg-gray-100/50",
  ghost: "bg-transparent",
  solid: "bg-slate-800 dark:bg-slate-800 bg-white border border-slate-800 dark:border-slate-800 border-gray-200",
  glass: "bg-white/5 dark:bg-white/5 bg-white/90 backdrop-blur-md"
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
  padding = 'md',
  rounded = 'lg',
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
    <Panel variant="default" rounded="xl" padding="lg" {...props} className={className}>
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

export function Alert({ className, children, intent = 'info', ...props }: Omit<PanelProps, 'variant'>) {
  return (
    <Panel 
      variant="subtle" 
      intent={intent}
      rounded="lg" 
      padding="md" 
      {...props} 
      className={className}
    >
      {children}
    </Panel>
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