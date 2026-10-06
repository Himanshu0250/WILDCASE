import React from 'react';

interface MetricRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const MetricRing: React.FC<MetricRingProps> = ({
  percentage,
  size = 140,
  strokeWidth = 10,
  label = 'AWAY TIME',
  sublabel = 'IN POCKET / REAL WORLD'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1b2027"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#df9f28"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-3xl font-extrabold text-case-paper leading-none">
            {percentage}%
          </span>
          <span className="font-mono text-[9px] text-case-amber font-bold tracking-widest uppercase mt-1">
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <span className="font-mono text-[10px] text-case-muted tracking-wider uppercase mt-2">
          {sublabel}
        </span>
      )}
    </div>
  );
};
