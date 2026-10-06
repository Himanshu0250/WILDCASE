import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  icon,
  isLoading,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          'w-full min-h-[48px] py-3.5 px-6 rounded-xl font-serif text-base font-bold tracking-wide transition-all duration-150',
          'bg-[#df9f28] hover:bg-[#ffb938] text-[#0c0e11] shadow-lg shadow-[#df9f28]/20',
          'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          'flex items-center justify-center space-x-2',
          className
        )
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-[#0c0e11] border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {children}
          {icon && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  icon,
  isLoading,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          'w-full min-h-[48px] py-3 px-4 rounded-xl font-mono text-xs font-semibold tracking-wider transition-all duration-150',
          'bg-[#15181d] hover:bg-[#1b2027] text-[#f3ebd7] border border-[#2a313d] hover:border-[#df9f28]/60',
          'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center space-x-2',
          className
        )
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-[#f3ebd7] border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
