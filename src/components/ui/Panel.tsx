/**
 * Panel Component - Consistent flat design system
 *
 * A flexible, themeable panel component that maintains visual consistency
 * across the entire application with a modern, flat design aesthetic.
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { LucideIcon, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { getPanelClasses, cardStyles, alertStyles, getAlertClasses, getAlertIconClasses } from "@/lib/panelStyles";

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
  return (
    <Component
      className={getPanelClasses(variant, {
        intent,
        padding,
        rounded,
        hoverable,
        clickable,
        disabled,
        className
      })}
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
  icon?: boolean | LucideIcon;
}

const alertIconMap = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

export function Alert({
  className,
  children,
  intent = 'info',
  title,
  icon = true,
  ...props
}: AlertProps) {
  const IconComponent = typeof icon === 'boolean' ? alertIconMap[intent] : icon;

  return (
    <div
      className={cn(getAlertClasses(intent), className)}
      {...props}
    >
      {icon && IconComponent && (
        <IconComponent className={getAlertIconClasses(intent)} />
      )}
      <div className={alertStyles.content.container}>
        {title && (
          <h3 className={cn(alertStyles.content.title, alertStyles.icon.colors[intent])}>
            {title}
          </h3>
        )}
        <div className={cn(
          alertStyles.content.body,
          title && alertStyles.content.bodyWithTitle
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