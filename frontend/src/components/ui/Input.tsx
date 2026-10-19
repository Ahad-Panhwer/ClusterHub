import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#252842]">
          {label} {props.required && <span className="text-[#FFAD91]">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777D96]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#252842] placeholder:text-[#777D96]/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]/20 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-[#FFAD91] focus:border-[#FFAD91]'
              : 'border-[#E9EAF3] hover:border-[#D8DAE8] focus:border-[#8B7CF6]'
          } ${disabled ? 'bg-[#F8F9FE] text-[#777D96] cursor-not-allowed' : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777D96]">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#FFAD91] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#777D96]">{helperText}</p>
      ) : null}
    </div>
  );
};
