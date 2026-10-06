import { useEffect, useState } from 'react';

export interface VisibilityMetrics {
  isVisible: boolean;
  screenTimeMs: number;
  awayTimeMs: number;
  awayPercentage: number;
}

export function usePageVisibility(
  isActive: boolean,
  onTick?: (isVisible: boolean, now: number) => void
) {
  const [isVisible, setIsVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  useEffect(() => {
    if (!isActive || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      onTick?.(visible, Date.now());
    };

    const handleWindowFocus = () => {
      setIsVisible(true);
      onTick?.(true, Date.now());
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
      onTick?.(false, Date.now());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    // Heartbeat ticker every 1000ms
    const interval = setInterval(() => {
      const visible = document.visibilityState === 'visible';
      onTick?.(visible, Date.now());
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      clearInterval(interval);
    };
  }, [isActive, onTick]);

  return { isVisible };
}
