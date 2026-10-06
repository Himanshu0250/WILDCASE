/**
 * WILDCASE Centralized Color Tokens
 * Aesthetic: Cinematic Detective Field Journal
 */
export const CaseColors = {
  // Neutral & Atmosphere
  charcoal: '#0c0e11',
  weatheredBlack: '#15181d',
  cardSurface: '#1b2027',
  border: '#2a313d',
  mutedText: '#7a8599',

  // Tactile Dossier & Paper
  warmPaper: '#f3ebd7',
  agedCream: '#eae0c8',
  paperDark: '#ded2b4',
  ink: '#1e1c18',
  inkMuted: '#575246',

  // Natural Elements
  deepForest: '#132118',
  forestCard: '#1a2e22',
  moss: '#467458',
  mossMuted: '#2f523d',

  // Evidentiary Accents
  mutedAmber: '#df9f28',
  amberGlow: '#ffb938',
  evidenceRed: '#c23b2d',
  redStamp: '#a82c20',
  darkBlue: '#1c2838',
  moonlightCyan: '#5898ab',
  cyanGlow: '#7ec0d4'
} as const;

export type CaseColorKey = keyof typeof CaseColors;
