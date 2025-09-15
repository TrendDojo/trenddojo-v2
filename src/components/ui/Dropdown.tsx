"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  position?: "left" | "right" | "center";
  width?: "sm" | "md" | "lg" | "xl" | "full";
  maxHeight?: string;
}

export function Dropdown({
  isOpen,
  onClose,
  children,
  className,
  position = "left",
  width = "md",
  maxHeight = "70vh",
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdown AND not on a dropdown trigger button
      const target = event.target as HTMLElement;
      const isDropdownButton = target.closest('button')?.closest('.dropdown-container');
      
      if (dropdownRef.current && 
          !dropdownRef.current.contains(target) && 
          !isDropdownButton) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
    xl: "w-96",
    full: "w-full",
  };

  const positionClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full mt-2",
        "bg-white dark:bg-slate-800",
        "rounded-lg",
        "shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]",
        "border dark:border-slate-600 border-gray-200",
        "ring-1 ring-black/5 dark:ring-white/10",
        "z-[9999]", // Very high z-index to appear above everything
        "overflow-hidden",
        widthClasses[width],
        positionClasses[position],
        className
      )}
      style={{ maxHeight }}
    >
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {children}
      </div>
    </div>
  );
}

// Optional: Dropdown section component for consistent styling
interface DropdownSectionProps {
  children: ReactNode;
  className?: string;
}

export function DropdownSection({ children, className }: DropdownSectionProps) {
  return (
    <div className={cn("py-2", className)}>
      {children}
    </div>
  );
}

// Optional: Dropdown item component for consistent styling
interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export function DropdownItem({ 
  children, 
  onClick, 
  className,
  active = false 
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2 text-left",
        "hover:bg-gray-100 dark:hover:bg-slate-700",
        "transition-colors",
        active && "bg-gray-100 dark:bg-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}