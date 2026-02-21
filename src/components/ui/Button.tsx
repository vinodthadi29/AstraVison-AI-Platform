import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
export interface ButtonProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  'default' |
  'destructive' |
  'outline' |
  'secondary' |
  'ghost' |
  'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-white text-black hover:bg-white/90',
          variant === 'destructive' &&
          'bg-red-500 text-white hover:bg-red-500/90',
          variant === 'outline' &&
          'border border-white/20 bg-transparent hover:bg-white/10 text-white',
          variant === 'secondary' && 'bg-white/20 text-white hover:bg-white/30',
          variant === 'ghost' && 'hover:bg-white/10 text-white',
          variant === 'link' && 'text-white underline-offset-4 hover:underline',
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-9 rounded-md px-3',
          size === 'lg' && 'h-11 rounded-md px-8',
          size === 'icon' && 'h-10 w-10',
          className
        )}
        ref={ref}
        {...props} />);


  }
);
Button.displayName = 'Button';