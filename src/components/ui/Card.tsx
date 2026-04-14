import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white shadow-sm border border-gray-100',
      outline: 'bg-transparent border border-gray-200',
      ghost: 'bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-4', variants[variant], className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
