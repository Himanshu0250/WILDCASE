import { MultiFrameStabilityResult } from './types.js';

export class MultiFrameAggregator {
  private frameBuffer: string[][] = [];
  private readonly maxBufferSize: number;
  private readonly minConsensusRatio: number;

  constructor(maxBufferSize: number = 4, minConsensusRatio: number = 0.6) {
    this.maxBufferSize = maxBufferSize;
    this.minConsensusRatio = minConsensusRatio;
  }

  /**
   * Pushes a new frame's descriptors into the rolling ring buffer.
   */
  public pushFrame(descriptors: string[]): MultiFrameStabilityResult {
    this.frameBuffer.push([...descriptors]);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.shift();
    }

    return this.evaluateStability();
  }

  /**
   * Clears the rolling buffer (e.g. when retaking or resetting focus).
   */
  public reset(): void {
    this.frameBuffer = [];
  }

  /**
   * Evaluates consensus across all buffered frames.
   */
  public evaluateStability(): MultiFrameStabilityResult {
    const totalFrames = this.frameBuffer.length;
    if (totalFrames === 0) {
      return {
        stableDescriptors: [],
        consensusRatio: 0.0,
        sampledFramesCount: 0,
        isStable: false,
        perFrameDescriptors: []
      };
    }

    // Count occurrences of each descriptor across frames
    const frequencyMap = new Map<string, number>();
    for (const frame of this.frameBuffer) {
      const uniqueFrameTags = new Set(frame);
      for (const tag of uniqueFrameTags) {
        frequencyMap.set(tag, (frequencyMap.get(tag) || 0) + 1);
      }
    }

    const stableDescriptors: string[] = [];
    let totalScoreSum = 0;
    let tagCount = 0;

    for (const [tag, count] of frequencyMap.entries()) {
      const ratio = count / totalFrames;
      totalScoreSum += ratio;
      tagCount++;

      // Descriptor is stable if it appears in at least minConsensusRatio of frames
      if (ratio >= this.minConsensusRatio) {
        stableDescriptors.push(tag);
      }
    }

    const averageConsensus = tagCount > 0 ? totalScoreSum / tagCount : 0.0;
    const isStable = totalFrames >= 3 && averageConsensus >= 0.55 && stableDescriptors.length >= 2;

    return {
      stableDescriptors,
      consensusRatio: Number(averageConsensus.toFixed(2)),
      sampledFramesCount: totalFrames,
      isStable,
      perFrameDescriptors: this.frameBuffer.map((f) => [...f])
    };
  }
}
