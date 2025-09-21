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
  content: string;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  children,
  content,
  delay = 500,
  position = 'top',
  className
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
    };

    switch (position) {
      case 'top':
        styles.left = coords.x;
        styles.bottom = window.innerHeight - coords.y + 8;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.left = coords.x;
        styles.top = coords.y + 8;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.right = window.innerWidth - coords.x + 8;
        styles.top = coords.y;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.left = coords.x + 8;
        styles.top = coords.y;
        styles.transform = 'translateY(-50%)';
        break;
    }

    return styles;
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          style={getTooltipStyles()}
          className={cn(
            'px-3 py-2 text-sm font-semibold rounded-lg transition-all pointer-events-none',
            'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
            'whitespace-nowrap shadow-lg',
            className
          )}
          role="tooltip"
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}