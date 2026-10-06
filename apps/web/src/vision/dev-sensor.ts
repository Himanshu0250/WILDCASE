import { EvidenceCandidate } from './types.js';

export interface DevSensorFixture {
  id: string;
  name: string;
  descriptors: string[];
  description: string;
}

export const DEV_SENSOR_PRESETS: DevSensorFixture[] = [
  {
    id: 'fixture-post',
    name: 'Perimeter Iron Post (Beat 1 Match)',
    descriptors: ['metal', 'vertical', 'fence', 'gate', 'boundary', 'outdoor'],
    description: 'Simulates vertical metal boundary post / gate.'
  },
  {
    id: 'fixture-bark',
    name: 'Weathered Bark / Stone (Beat 2 Match)',
    descriptors: ['weathered', 'rough', 'bark', 'rust', 'stone', 'dark', 'outdoor'],
    description: 'Simulates aged oxidized iron or rough tree bark surface.'
  },
  {
    id: 'fixture-organic',
    name: 'Damp Soil & Foliage (Beat 3 Match)',
    descriptors: ['organic', 'green', 'leaf', 'soil', 'moss', 'nature', 'outdoor'],
    description: 'Simulates undisturbed open earth, green moss, and damp soil.'
  },
  {
    id: 'fixture-bolt',
    name: 'Circular Metal Bolt (Beat 4 Match)',
    descriptors: ['metal', 'circular', 'bolt', 'fastener', 'plate', 'fixture', 'outdoor'],
    description: 'Simulates engineered circular fastener / bolt head.'
  },
  {
    id: 'fixture-mismatch',
    name: 'White Plastic Cup (Irrelevant Item)',
    descriptors: ['smooth', 'white', 'light', 'round', 'plastic'],
    description: 'Simulates an unrelated object that does not match case predicates.'
  }
];

export class DevelopmentSensor {
  public static isDevMode(): boolean {
    try {
      const isViteDev = (import.meta as any)?.env?.DEV === true;
      const gProcess = (globalThis as any).process;
      const isNodeTest = typeof gProcess !== 'undefined' && gProcess?.env?.NODE_ENV === 'test';
      return Boolean(isViteDev || isNodeTest);
    } catch {
      return false;
    }
  }

  public static generateCandidate(presetId: string): EvidenceCandidate {
    const preset = DEV_SENSOR_PRESETS.find((p) => p.id === presetId) || DEV_SENSOR_PRESETS[0];

    return {
      descriptors: [...preset.descriptors],
      quality: {
        usable: true,
        quality: 0.95,
        issues: [],
        metrics: {
          luminance: 128,
          contrast: 75,
          edgeEnergy: 65
        }
      },
      stability: {
        stableDescriptors: [...preset.descriptors],
        consensusRatio: 1.0,
        sampledFramesCount: 4,
        isStable: true,
        perFrameDescriptors: [preset.descriptors, preset.descriptors, preset.descriptors, preset.descriptors]
      },
      matchConfidence: 0.92,
      qualityLevel: 'VERIFIED'
    };
  }
}
