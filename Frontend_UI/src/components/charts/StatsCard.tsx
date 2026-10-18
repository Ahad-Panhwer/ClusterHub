import React from 'react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  badgeText?: string;
  badgePositive?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-[#F1EEFF]',
  iconTextColor = 'text-[#8B7CF6]',
  badgeText,
  badgePositive = true,
  onClick,
}) => {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={`p-5 relative overflow-hidden group border-[#E9EAF3] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Subtle decorative gradient flare in top corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/40 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-[#777D96] uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2.5 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#252842] tracking-tight font-heading">
              {value}
            </h3>
            {badgeText && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                  badgePositive
                    ? 'bg-[#ECFDF5] border-[#D1F7E8] text-[#0D6B49]'
                    : 'bg-[#FFF2EE] border-[#FFD8CC] text-[#A63519]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badgePositive ? 'bg-[#6FD6B0]' : 'bg-[#FFAD91]'}`} />
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#777D96] mt-2 flex items-center gap-1.5 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-2xl ${iconBgColor} ${iconTextColor} border border-white/60 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-108 group-hover:rotate-1`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
