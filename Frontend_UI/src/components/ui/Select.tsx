import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#252842]">
          {label} {props.required && <span className="text-[#FFAD91]">*</span>}
        </label>
      )}

      <div className="relative rounded-xl">
        <select
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-[#252842] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]/20 cursor-pointer ${
            error
              ? 'border-[#FFAD91] focus:border-[#FFAD91]'
              : 'border-[#E9EAF3] hover:border-[#D8DAE8] focus:border-[#8B7CF6]'
          } ${disabled ? 'bg-[#F8F9FE] text-[#777D96] cursor-not-allowed' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#777D96]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-[#FFAD91] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#777D96]">{helperText}</p>
      ) : null}
    </div>
  );
};
