import { FrameQualityIssue, FrameQualityResult } from './types.js';

export class FrameQualityChecker {
  /**
   * Evaluates raw pixel data from an image buffer to verify lighting, contrast, and focus.
   * Discards unviable frames before descriptor extraction occurs.
   */
  public static checkQuality(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): FrameQualityResult {
    const pixelCount = width * height;
    if (pixelCount === 0 || data.length === 0) {
      return {
        usable: false,
        quality: 0.0,
        issues: ['insufficient_detail'],
        metrics: { luminance: 0, contrast: 0, edgeEnergy: 0 }
      };
    }

    let totalLuminance = 0;
    const sampleStep = 4; // Sample every pixel (RGBA)
    const grayBuffer = new Float32Array(pixelCount);

    let idx = 0;
    for (let i = 0; i < data.length; i += sampleStep) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      grayBuffer[idx++] = lum;
      totalLuminance += lum;
    }

    const avgLuminance = totalLuminance / pixelCount;

    // Calculate Variance / Contrast
    let varianceSum = 0;
    for (let i = 0; i < pixelCount; i++) {
      const diff = grayBuffer[i] - avgLuminance;
      varianceSum += diff * diff;
    }
    const stdDev = Math.sqrt(varianceSum / pixelCount);
    const contrastScore = Math.min(100, Math.round(stdDev * 1.5));

    // Calculate Laplacian Gradient Energy for Blur / Focus estimation
    let laplacianEnergySum = 0;
    let edgePixelCount = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = grayBuffer[y * width + x];
        const up = grayBuffer[(y - 1) * width + x];
        const down = grayBuffer[(y + 1) * width + x];
        const left = grayBuffer[y * width + (x - 1)];
        const right = grayBuffer[y * width + (x + 1)];

        const laplacian = Math.abs(4 * center - up - down - left - right);
        laplacianEnergySum += laplacian;
        edgePixelCount++;
      }
    }

    const meanLaplacian = edgePixelCount > 0 ? laplacianEnergySum / edgePixelCount : 0;
    const edgeEnergyScore = Math.min(100, Math.round(meanLaplacian * 4.0));

    const issues: FrameQualityIssue[] = [];

    // Quality thresholds
    if (avgLuminance < 28) {
      issues.push('too_dark');
    } else if (avgLuminance > 232) {
      issues.push('too_bright');
    }

    if (edgeEnergyScore < 8 && contrastScore < 15) {
      issues.push('too_blurry');
    } else if (contrastScore < 10) {
      issues.push('insufficient_detail');
    }

    // Compute aggregate quality score (0.0 to 1.0)
    let score = 1.0;
    if (avgLuminance < 40) score -= (40 - avgLuminance) * 0.02;
    if (avgLuminance > 220) score -= (avgLuminance - 220) * 0.02;
    if (contrastScore < 25) score -= (25 - contrastScore) * 0.015;
    if (edgeEnergyScore < 15) score -= (15 - edgeEnergyScore) * 0.02;

    const normalizedQuality = Math.max(0.1, Math.min(1.0, Number(score.toFixed(2))));
    const usable = issues.length === 0 && normalizedQuality >= 0.45;

    return {
      usable,
      quality: normalizedQuality,
      issues,
      metrics: {
        luminance: Math.round(avgLuminance),
        contrast: contrastScore,
        edgeEnergy: edgeEnergyScore
      }
    };
  }
}
