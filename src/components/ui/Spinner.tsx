/**
 * Spinner Component - Living Theme System
 * Universal loading spinner with semantic styling
 */

import { spinnerStyles, SpinnerSize, SpinnerColor, SpinnerSpacing } from '@/lib/spinnerStyles';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  spacing?: SpinnerSpacing;
  text?: string;
  className?: string;
  centered?: boolean;
}

export function Spinner({
  size = 'lg',
  color = 'primary',
  spacing = 'md',
  text,
  className,
  centered = true,
}: SpinnerProps) {
  const spinnerElement = (
    <svg
      className={cn(
        spinnerStyles.size[size],
        spinnerStyles.color[color],
        spinnerStyles.animation,
        text && spinnerStyles.spacing[spacing],
        className
      )}
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
  );

  if (!centered && !text) {
    return spinnerElement;
  }

  return (
    <div className={cn(spinnerStyles.container, !centered && 'items-start')}>
      {spinnerElement}
      {text && <p className={spinnerStyles.text.base}>{text}</p>}
    </div>
  );
}

// Convenience exports for common spinner patterns
export function PageSpinner({ text = 'Loading...' }: { text?: string }) {
  return <Spinner size="xl" text={text} />;
}

export function SectionSpinner({ text }: { text?: string }) {
  return <Spinner size="lg" text={text} />;
}

export function InlineSpinner() {
  return <Spinner size="sm" centered={false} />;
}

export function ButtonSpinner() {
  return <Spinner size="xs" color="white" centered={false} />;
}
