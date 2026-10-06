import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EvidenceStampProps {
  label: string;
  variant?: 'classified' | 'solved' | 'danger' | 'verified' | 'open';
  className?: string;
}

export const EvidenceStamp: React.FC<EvidenceStampProps> = ({
  label,
  variant = 'classified',
  className
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'solved':
      case 'verified':
        return 'border-[#467458] text-[#467458] -rotate-3';
      case 'danger':
        return 'border-[#c23b2d] text-[#c23b2d] -rotate-6';
      case 'open':
        return 'border-[#df9f28] text-[#df9f28] -rotate-2';
      case 'classified':
      default:
        return 'border-[#c23b2d] text-[#c23b2d] -rotate-6';
    }
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-block font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 border-2 rounded shadow-sm',
          getVariantStyles(),
          className
        )
      )}
    >
      {label}
    </span>
  );
};
