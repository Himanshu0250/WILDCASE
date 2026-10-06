export const SUPPORTED_MATERIALS = [
  'metal',
  'wood',
  'wood-like',
  'stone',
  'stone-like',
  'concrete',
  'concrete-like',
  'glass',
  'glass-like',
  'organic',
  'unknown'
] as const;

export const SUPPORTED_SHAPES = [
  'vertical',
  'horizontal',
  'circular',
  'rectangular',
  'irregular',
  'flat',
  'elongated',
  'post',
  'fence',
  'pillar',
  'gate',
  'wall',
  'boundary'
] as const;

export const SUPPORTED_SURFACES = [
  'smooth',
  'rough',
  'textured',
  'reflective',
  'matte',
  'weathered',
  'bark',
  'rust',
  'oxidized'
] as const;

export const SUPPORTED_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'dark',
  'light',
  'neutral',
  'bright',
  'color_anomaly'
] as const;

export const SUPPORTED_OBJECT_HINTS = [
  'sign',
  'sign-like',
  'post',
  'post-like',
  'wall',
  'wall-like',
  'rail',
  'rail-like',
  'path',
  'path-like',
  'vegetation',
  'vegetation-like',
  'leaf',
  'soil',
  'grass',
  'moss',
  'earth',
  'bolt',
  'fastener',
  'plate',
  'fixture',
  'bracket',
  'outdoor',
  'structural',
  'brick',
  'mortar',
  'rubber',
  'seal',
  'joint',
  'tube',
  'nature',
  'unknown'
] as const;

export const ALL_SUPPORTED_DESCRIPTORS = new Set<string>([
  ...SUPPORTED_MATERIALS,
  ...SUPPORTED_SHAPES,
  ...SUPPORTED_SURFACES,
  ...SUPPORTED_COLORS,
  ...SUPPORTED_OBJECT_HINTS
]);

export function isDescriptorSupported(descriptor: string): boolean {
  const norm = descriptor.toLowerCase().trim();
  return ALL_SUPPORTED_DESCRIPTORS.has(norm);
}
