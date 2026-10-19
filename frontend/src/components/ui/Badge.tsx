import React from 'react';

export type BadgeVariant =
  | 'in_progress'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'registration_open'
  | 'draft'
  | 'confirmed'
  | 'pending'
  | 'waitlist'
  | 'neutral'
  | 'lavender';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; border: string; text: string; dot: string }> = {
  in_progress: {
    bg: 'bg-[#EBF5FE]',
    border: 'border-[#CCE6FD]',
    text: 'text-[#0C6AB0]',
    dot: 'bg-[#67B7F7] shadow-[0_0_8px_#67B7F7] animate-pulse',
  },
  scheduled: {
    bg: 'bg-[#FEF9EB]',
    border: 'border-[#FDE8B5]',
    text: 'text-[#96680A]',
    dot: 'bg-[#FFD978]',
  },
  completed: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#C6F5E1]',
    text: 'text-[#0D6B49]',
    dot: 'bg-[#6FD6B0]',
  },
  cancelled: {
    bg: 'bg-[#FFF2EE]',
    border: 'border-[#FFD4C4]',
    text: 'text-[#A63519]',
    dot: 'bg-[#FFAD91]',
  },
  registration_open: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#C6F5E1]',
    text: 'text-[#0D6B49]',
    dot: 'bg-[#6FD6B0] shadow-[0_0_8px_#6FD6B0] animate-pulse',
  },
  draft: {
    bg: 'bg-[#F1EEFF]',
    border: 'border-[#E0D8FD]',
    text: 'text-[#6C5CDA]',
    dot: 'bg-[#8B7CF6]',
  },
  confirmed: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#C6F5E1]',
    text: 'text-[#0D6B49]',
    dot: 'bg-[#6FD6B0]',
  },
  pending: {
    bg: 'bg-[#FEF9EB]',
    border: 'border-[#FDE8B5]',
    text: 'text-[#96680A]',
    dot: 'bg-[#FFD978]',
  },
  waitlist: {
    bg: 'bg-[#FFF2EE]',
    border: 'border-[#FFD4C4]',
    text: 'text-[#A63519]',
    dot: 'bg-[#FFAD91]',
  },
  neutral: {
    bg: 'bg-[#F8F9FE]',
    border: 'border-[#E9EAF3]',
    text: 'text-[#777D96]',
    dot: 'bg-[#777D96]',
  },
  lavender: {
    bg: 'bg-[#F1EEFF]',
    border: 'border-[#E0D8FD]',
    text: 'text-[#8B7CF6]',
    dot: 'bg-[#8B7CF6] shadow-[0_0_8px_#8B7CF6]',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  showDot = true,
  className = '',
}) => {
  const config = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase border shadow-2xs select-none ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span>{children}</span>
    </span>
  );
};
