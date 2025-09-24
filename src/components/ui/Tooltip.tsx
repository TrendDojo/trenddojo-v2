/**
 * Tooltip Component - Custom styled tooltips
 *
 * Provides consistent tooltip styling that matches the filter pill design
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  wrapperClassName?: string;
  arrow?: boolean;
  maxWidth?: number;
}

export function Tooltip({
  children,
  content,
  delay = 500,
  position = 'top',
  className,
  wrapperClassName = 'inline-block',
  arrow = false,
  maxWidth = 200
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom;
          break;
        case 'left':
          x = rect.left;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right;
          y = rect.top + rect.height / 2;
          break;
      }

      setCoords({ x, y });
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipStyles = () => {
    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: `${maxWidth}px`,
    };

    const arrowOffset = arrow ? 6 : 0; // Additional offset when arrow is present

    switch (position) {
      case 'top':
        styles.left = coords.x;
        styles.bottom = window.innerHeight - coords.y + 8 + arrowOffset;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.left = coords.x;
        styles.top = coords.y + 8 + arrowOffset;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.right = window.innerWidth - coords.x + 8 + arrowOffset;
        styles.top = coords.y;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.left = coords.x + 8 + arrowOffset;
        styles.top = coords.y;
        styles.transform = 'translateY(-50%)';
        break;
    }

    return styles;
  };

  const getArrowStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
        };
      case 'left':
        return {
          ...baseStyles,
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
        };
      case 'right':
        return {
          ...baseStyles,
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
        };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={wrapperClassName}
      >
        {children}
      </div>

      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          style={getTooltipStyles()}
          className={cn(
            'px-3 py-2 text-sm font-semibold rounded-lg transition-all pointer-events-none relative',
            'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
            'shadow-lg',
            className
          )}
          role="tooltip"
        >
          {content}
          {arrow && (
            <div
              style={getArrowStyles()}
              className={cn(
                position === 'top' && 'border-t-gray-900 dark:border-t-gray-100 border-l-transparent border-r-transparent',
                position === 'bottom' && 'border-b-gray-900 dark:border-b-gray-100 border-l-transparent border-r-transparent border-t-transparent',
                position === 'left' && 'border-l-gray-900 dark:border-l-gray-100 border-t-transparent border-b-transparent border-r-transparent',
                position === 'right' && 'border-r-gray-900 dark:border-r-gray-100 border-t-transparent border-b-transparent border-l-transparent'
              )}
            />
          )}
        </div>,
        document.body
      )}
    </>
  );
}