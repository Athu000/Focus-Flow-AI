import React from 'react';
import { cn } from '../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-800',
      success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      warning: 'bg-amber-100 text-amber-700 border border-amber-200',
      danger: 'bg-rose-100 text-rose-700 border border-rose-200',
      info: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
