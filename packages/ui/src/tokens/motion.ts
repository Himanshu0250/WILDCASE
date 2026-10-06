/**
 * WILDCASE Motion Tokens & Transitions
 */
export const CaseMotion = {
  durations: {
    fast: '150ms',
    normal: '250ms',
    cinematic: '500ms',
    pulse: '3000ms'
  },
  easings: {
    tactile: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)'
  },
  classes: {
    stampIn: 'animate-stamp-in',
    paperReveal: 'animate-paper-reveal',
    sonarPing: 'animate-sonar-ping',
    pulseSlow: 'animate-pulse-slow',
    buttonPress: 'active:scale-[0.98] transition-transform duration-150'
  }
} as const;
