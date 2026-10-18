import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  disabled,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-[#252842]">
          {label} {props.required && <span className="text-[#FFAD91]">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#252842] placeholder:text-[#777D96]/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]/20 resize-none ${
          error
            ? 'border-[#FFAD91] focus:border-[#FFAD91]'
            : 'border-[#E9EAF3] hover:border-[#D8DAE8] focus:border-[#8B7CF6]'
        } ${disabled ? 'bg-[#F8F9FE] text-[#777D96] cursor-not-allowed' : ''} ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-[#FFAD91] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#777D96]">{helperText}</p>
      ) : null}
    </div>
  );
};
