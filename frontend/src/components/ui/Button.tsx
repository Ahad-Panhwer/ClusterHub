import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#8B7CF6] text-white hover:bg-[#7A6AE6] focus-visible:ring-[#8B7CF6] shadow-sm shadow-[#8B7CF6]/25 hover:-translate-y-0.5',
    secondary:
      'bg-[#F1EEFF] text-[#8B7CF6] border border-[#E0D8FD] hover:bg-[#E5E0FD] focus-visible:ring-[#8B7CF6]',
    outline:
      'border border-[#E9EAF3] bg-white text-[#252842] hover:bg-[#F8F9FE] hover:border-[#D0D3E5] focus-visible:ring-[#8B7CF6] shadow-2xs hover:-translate-y-0.5',
    danger:
      'bg-[#FFF2EE] text-[#A63519] border border-[#FFD4C4] hover:bg-[#FFE5DC] focus-visible:ring-[#FFAD91]',
    ghost:
      'bg-transparent text-[#777D96] hover:text-[#252842] hover:bg-[#F1EEFF] focus-visible:ring-[#8B7CF6]',
    success:
      'bg-[#ECFDF5] text-[#0D6B49] border border-[#C6F5E1] hover:bg-[#D6F8EB] focus-visible:ring-[#6FD6B0]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
