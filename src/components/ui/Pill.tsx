import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PillProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

const sizeClasses = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
  lg: "px-5 py-2 text-base",
};

const variantClasses = {
  default: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
  primary: "bg-indigo-600 text-white",
  secondary: "bg-purple-700 text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
};

export function Pill({
  children,
  size = "md",
  variant = "default",
  selected = false,
  onClick,
  onRemove,
  className,
}: PillProps) {
  const isClickable = !!onClick;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full transition-colors",
        sizeClasses[size],
        selected ? variantClasses[variant] : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300",
        isClickable && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full p-0.5 transition-colors",
            size === "xs" && "-mr-0.5 ml-0",
            size === "sm" && "-mr-0.5 ml-0",
            size === "md" && "-mr-1 ml-0.5",
            size === "lg" && "-mr-1.5 ml-1"
          )}
        >
          <svg 
            className={cn(
              "text-current",
              size === "xs" && "w-2.5 h-2.5",
              size === "sm" && "w-3 h-3",
              size === "md" && "w-3.5 h-3.5",
              size === "lg" && "w-4 h-4"
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}