export type FrameQualityIssue =
  | 'too_dark'
  | 'too_bright'
  | 'too_blurry'
  | 'insufficient_detail'
  | 'unstable_frame';

export interface FrameQualityResult {
  usable: boolean;
  quality: number; // 0.0 to 1.0
  issues: FrameQualityIssue[];
  metrics: {
    luminance: number; // 0 to 255
    contrast: number; // 0 to 100
    edgeEnergy: number; // 0 to 100
  };
}

export interface VisualDescriptorSet {
  descriptors: string[];
  material: string;
  shape: string;
  surface: string;
  colorFamily: string;
  objectHint: string;
  roughness: number; // 0.0 to 1.0
  edgeDensity: number; // 0.0 to 1.0
  verticalBias: number; // 0.0 to 1.0
  horizontalBias: number; // 0.0 to 1.0
  circularBias: number; // 0.0 to 1.0
}

export interface MultiFrameStabilityResult {
  stableDescriptors: string[];
  consensusRatio: number; // 0.0 to 1.0
  sampledFramesCount: number;
  isStable: boolean;
  perFrameDescriptors: string[][];
}

export interface EvidenceCandidate {
  descriptors: string[];
  quality: FrameQualityResult;
  stability: MultiFrameStabilityResult;
  matchConfidence: number; // 0.0 to 1.0
  qualityLevel: 'NO_SIGNAL' | 'PARTIAL' | 'PROMISING' | 'VERIFIED';
}
