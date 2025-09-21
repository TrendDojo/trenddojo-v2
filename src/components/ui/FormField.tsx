"use client";

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  helper,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {helper && !error && (
        <p className="text-sm dark:text-gray-400 text-gray-600">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 rounded-lg transition-colors",
        "dark:bg-slate-900/50 bg-gray-50",
        "dark:text-white text-gray-900",
        "placeholder:text-gray-500 dark:placeholder:text-gray-500",
        error
          ? "ring-2 ring-rose-500 dark:ring-rose-400 focus:ring-rose-500"
          : "ring-1 ring-gray-200 dark:ring-slate-700",
        "focus:outline-none focus:ring-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !error && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
        className
      )}
      {...props}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 rounded-lg transition-colors",
        "dark:bg-slate-900/50 bg-gray-50",
        "dark:text-white text-gray-900",
        "placeholder:text-gray-500 dark:placeholder:text-gray-500",
        error
          ? "ring-2 ring-rose-500 dark:ring-rose-400 focus:ring-rose-500"
          : "ring-1 ring-gray-200 dark:ring-slate-700",
        "focus:outline-none focus:ring-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !error && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
        "min-h-[100px] resize-y",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full px-4 py-3 rounded-lg transition-colors",
        "dark:bg-slate-900/50 bg-gray-50",
        "dark:text-white text-gray-900",
        error
          ? "ring-2 ring-rose-500 dark:ring-rose-400 focus:ring-rose-500"
          : "ring-1 ring-gray-200 dark:ring-slate-700",
        "focus:outline-none focus:ring-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !error && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className={cn(
          "w-4 h-4 rounded border transition-colors cursor-pointer",
          "dark:bg-slate-700 bg-white",
          "dark:border-gray-600 border-gray-300",
          "dark:checked:bg-indigo-600 checked:bg-indigo-600",
          "text-indigo-600 focus:ring-indigo-500",
          "focus:ring-2 focus:ring-offset-2",
          "dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      <span className="text-sm dark:text-gray-200 text-gray-700">{label}</span>
    </label>
  );
}

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        className={cn(
          "w-4 h-4 border transition-colors cursor-pointer",
          "dark:bg-slate-800 bg-white",
          "dark:border-slate-600 border-gray-300",
          "text-indigo-600 focus:ring-indigo-500",
          "focus:ring-2 focus:ring-offset-2",
          "dark:focus:ring-offset-slate-900 focus:ring-offset-gray-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      <span className="text-sm dark:text-gray-200 text-gray-700">{label}</span>
    </label>
  );
}