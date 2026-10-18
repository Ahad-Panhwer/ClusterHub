import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: 'default' | 'lavender' | 'blue' | 'mint' | 'yellow';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border-[#E9EAF3]',
    lavender: 'bg-linear-to-b from-[#FAF8FF] to-white border-[#E5E0FD]',
    blue: 'bg-linear-to-b from-[#F5F9FE] to-white border-[#DDECFA]',
    mint: 'bg-linear-to-b from-[#F2FBF7] to-white border-[#D6F5E8]',
    yellow: 'bg-linear-to-b from-[#FFFDF5] to-white border-[#FDE8B5]',
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-pastel-sm transition-all duration-200 ${variantStyles[variant]} ${
        hoverable
          ? 'hover:shadow-pastel-md hover:border-[#D0D3E5] hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div className="flex items-start gap-2.5">
      {icon && (
        <div className="w-8 h-8 rounded-xl bg-[#F1EEFF] text-[#8B7CF6] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-[#E5E0FD]">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-extrabold text-[#252842] tracking-tight font-heading">{title}</h3>
        {subtitle && <p className="text-xs text-[#777D96] mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
