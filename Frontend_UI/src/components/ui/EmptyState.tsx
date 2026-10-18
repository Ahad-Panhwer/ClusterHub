import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-dashed border-[#E9EAF3] ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F1EEFF] text-[#8B7CF6] flex items-center justify-center mb-4 shadow-xs">
        {icon || <Gamepad2 className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-[#252842]">{title}</h3>
      <p className="text-sm text-[#777D96] max-w-sm mt-1.5 mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
