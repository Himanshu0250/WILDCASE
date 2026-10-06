import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StatusBadgeProps {
  label: string;
  variant?: 'active' | 'locked' | 'confirmed' | 'pending';
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'active',
  icon,
  className
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'confirmed':
        return 'bg-[#467458]/20 text-[#467458] border-[#467458]/40';
      case 'locked':
        return 'bg-[#15181d] text-[#7a8599] border-[#2a313d]';
      case 'pending':
        return 'bg-[#1c2838] text-[#5898ab] border-[#5898ab]/40';
      case 'active':
      default:
        return 'bg-[#df9f28]/20 text-[#df9f28] border-[#df9f28]/50';
    }
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider',
          getStyles(),
          className
        )
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
