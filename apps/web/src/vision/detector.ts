import { FrameQualityChecker } from './frame-quality.js';
import { MultiFrameAggregator } from './multi-frame.js';
import {
  EvidenceCandidate,
  FrameQualityResult,
  MultiFrameStabilityResult,
  VisualDescriptorSet
} from './types.js';

export interface VisionAnalysisResult {
  usable: boolean;
  quality: FrameQualityResult;
  descriptors: VisualDescriptorSet;
  stability: MultiFrameStabilityResult;
  candidate: EvidenceCandidate;
}

export class OnDeviceVisionDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private multiFrameAggregator: MultiFrameAggregator;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 96;
    this.canvas.height = 96;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.multiFrameAggregator = new MultiFrameAggregator(4, 0.6);
  }

  /**
   * Resets the multi-frame buffer.
   */
  public resetStabilityBuffer(): void {
    this.multiFrameAggregator.reset();
  }

  /**
   * Analyzes an HTMLVideoElement, HTMLCanvasElement, or HTMLImageElement frame on-device.
   * Zero raw images or video buffers are persisted or transmitted.
   */
  public analyzeFrame(
    source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): VisionAnalysisResult {
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (!this.ctx) {
      const fallbackQuality: FrameQualityResult = {
        usable: false,
        quality: 0.0,
        issues: ['insufficient_detail'],
        metrics: { luminance: 0, contrast: 0, edgeEnergy: 0 }
      };
      const fallbackStability = this.multiFrameAggregator.evaluateStability();
      return {
        usable: false,
        quality: fallbackQuality,
        descriptors: {
          descriptors: ['outdoor', 'unknown'],
          material: 'unknown',
          shape: 'irregular',
          surface: 'matte',
          colorFamily: 'neutral',
          objectHint: 'unknown',
          roughness: 0.5,
          edgeDensity: 0.5,
          verticalBias: 0.5,
          horizontalBias: 0.5,
          circularBias: 0.5
        },
        stability: fallbackStability,
        candidate: {
          descriptors: ['outdoor'],
          quality: fallbackQuality,
          stability: fallbackStability,
          matchConfidence: 0.4,
          qualityLevel: 'NO_SIGNAL'
        }
      };
    }

    // 1. Draw source to downscaled offscreen analysis canvas (96x96)
    this.ctx.drawImage(source, 0, 0, w, h);
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 2. Perform Frame Quality Verification
    const qualityResult = FrameQualityChecker.checkQuality(data, w, h);
    if (!qualityResult.usable) {
      const stabilityResult = this.multiFrameAggregator.evaluateStability();
      return {
        usable: false,
        quality: qualityResult,
        descriptors: {
          descriptors: ['unusable_frame'],
          material: 'unknown',
          shape: 'irregular',
          surface: 'matte',
          colorFamily: 'neutral',
          objectHint: 'unknown',
          roughness: 0.1,
          edgeDensity: 0.1,
          verticalBias: 0.0,
          horizontalBias: 0.0,
          circularBias: 0.0
        },
        stability: stabilityResult,
        candidate: {
          descriptors: [],
          quality: qualityResult,
          stability: stabilityResult,
          matchConfidence: 0.1,
          qualityLevel: 'NO_SIGNAL'
        }
      };
    }

    // 3. First Pass: Color Histograms & Luminance
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let maxR = 0;
    let maxG = 0;
    let maxB = 0;

    const pixelCount = w * h;
    const lumArray = new Float32Array(pixelCount);

    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      totalR += r;
      totalG += g;
      totalB += b;
      if (r > maxR) maxR = r;
      if (g > maxG) maxG = g;
      if (b > maxB) maxB = b;

      lumArray[p] = (r * 0.299 + g * 0.587 + b * 0.114);
    }

    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    const avgLuminance = (avgR + avgG + avgB) / 3;

    // 4. Second Pass: Directional Sobel Gradients & Texture Statistics
    let highContrastEdges = 0;
    let verticalGradients = 0;
    let horizontalGradients = 0;
    let circularContourPoints = 0;
    let totalGradientSum = 0;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;

        // Sobel kernels
        const gx =
          -lumArray[(y - 1) * w + (x - 1)] +
          lumArray[(y - 1) * w + (x + 1)] -
          2 * lumArray[y * w + (x - 1)] +
          2 * lumArray[y * w + (x + 1)] -
          lumArray[(y + 1) * w + (x - 1)] +
          lumArray[(y + 1) * w + (x + 1)];

        const gy =
          -lumArray[(y - 1) * w + (x - 1)] -
          2 * lumArray[(y - 1) * w + x] -
          lumArray[(y - 1) * w + (x + 1)] +
          lumArray[(y + 1) * w + (x - 1)] +
          2 * lumArray[(y + 1) * w + x] +
          lumArray[(y + 1) * w + (x + 1)];

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        totalGradientSum += magnitude;

        if (magnitude > 45) {
          highContrastEdges++;
        }

        // Vertical structure bias (gx dominates)
        if (Math.abs(gx) > Math.abs(gy) * 1.6 && magnitude > 35) {
          verticalGradients++;
        }

        // Horizontal structure bias (gy dominates)
        if (Math.abs(gy) > Math.abs(gx) * 1.6 && magnitude > 35) {
          horizontalGradients++;
        }

        // Circular contour approximation: checks radial edge alignment in central region
        const cx = w / 2;
        const cy = h / 2;
        const dx = x - cx;
        const dy = y - cy;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);

        if (distFromCenter >= 10 && distFromCenter <= 38 && magnitude > 30) {
          // Dot product between normalized gradient vector and radial position vector
          const dot = (gx * dx + gy * dy) / (magnitude * distFromCenter || 1);
          if (Math.abs(dot) > 0.65) {
            circularContourPoints++;
          }
        }
      }
    }

    const textureRoughness = Math.min(1.0, highContrastEdges / (pixelCount * 0.12));
    const edgeDensity = Math.min(1.0, totalGradientSum / (pixelCount * 30));
    const verticalBias = Math.min(1.0, verticalGradients / (pixelCount * 0.05));
    const horizontalBias = Math.min(1.0, horizontalGradients / (pixelCount * 0.05));
    const circularBias = Math.min(1.0, circularContourPoints / 180);

    const descriptors: string[] = ['outdoor'];

    // 5. Categorization: Color Family
    let colorFamily = 'neutral';
    if (avgR > avgG * 1.3 && avgR > avgB * 1.3 && avgR > 90) {
      colorFamily = 'red';
      descriptors.push('red', 'color_anomaly');
    } else if (avgR > 130 && avgG > 115 && avgB < 95) {
      colorFamily = 'yellow';
      descriptors.push('yellow', 'bright');
    } else if (avgG > avgR * 1.15 && avgG > avgB * 1.15) {
      colorFamily = 'green';
      descriptors.push('green', 'organic', 'leaf', 'nature');
    } else if (avgB > avgR * 1.2 && avgB > avgG * 1.1) {
      colorFamily = 'blue';
      descriptors.push('blue');
    } else if (avgLuminance < 65) {
      colorFamily = 'dark';
      descriptors.push('dark', 'weathered');
    } else if (avgLuminance > 180) {
      colorFamily = 'light';
      descriptors.push('light', 'bright');
    }

    // 6. Categorization: Material & Surface
    let material = 'unknown';
    let surface = 'matte';

    if (textureRoughness > 0.42) {
      surface = 'rough';
      descriptors.push('rough', 'weathered');
      if (colorFamily === 'green') {
        material = 'organic';
        descriptors.push('organic', 'leaf', 'soil', 'grass', 'moss', 'nature');
      } else {
        material = 'stone-like';
        descriptors.push('stone', 'textured', 'brick', 'mortar', 'bark');
      }
    } else if (edgeDensity > 0.38) {
      material = 'metal';
      surface = 'smooth';
      descriptors.push('metal', 'structural');
    } else if (textureRoughness < 0.2 && edgeDensity < 0.25) {
      surface = 'smooth';
      descriptors.push('smooth');
    }

    // 7. Categorization: Shape & Structure
    let shape = 'irregular';
    if (verticalBias > 0.35) {
      shape = 'vertical';
      descriptors.push('vertical', 'post', 'fence', 'pillar', 'gate', 'boundary');
    } else if (circularBias > 0.35) {
      shape = 'circular';
      descriptors.push('circular', 'bolt', 'fastener', 'plate', 'fixture');
    } else if (horizontalBias > 0.35) {
      shape = 'horizontal';
      descriptors.push('horizontal', 'rail', 'wall');
    }

    // 8. Categorization: Object / Scene Hint
    let objectHint = 'unknown';
    if (descriptors.includes('sign') || (shape === 'vertical' && descriptors.includes('metal'))) {
      objectHint = 'post-like';
      descriptors.push('sign', 'plate');
    } else if (material === 'organic') {
      objectHint = 'vegetation-like';
      descriptors.push('leaf', 'vegetation', 'moss');
    }

    const uniqueDescriptors = Array.from(new Set(descriptors));

    // 9. Update Multi-Frame Stability Buffer
    const stabilityResult = this.multiFrameAggregator.pushFrame(uniqueDescriptors);

    // 10. Compute Evidence Match Confidence Score
    // Formula: (Frame Quality * 0.30) + (Stability Consensus * 0.30) + (Salience Count * 0.20) + (Edge Clarity * 0.20)
    const salienceRatio = Math.min(1.0, uniqueDescriptors.length / 6);
    const rawConfidence =
      qualityResult.quality * 0.3 +
      stabilityResult.consensusRatio * 0.3 +
      salienceRatio * 0.2 +
      edgeDensity * 0.2;

    const matchConfidence = Number(Math.min(1.0, Math.max(0.2, rawConfidence)).toFixed(2));

    const visualDescriptorSet: VisualDescriptorSet = {
      descriptors: uniqueDescriptors,
      material,
      shape,
      surface,
      colorFamily,
      objectHint,
      roughness: Number(textureRoughness.toFixed(2)),
      edgeDensity: Number(edgeDensity.toFixed(2)),
      verticalBias: Number(verticalBias.toFixed(2)),
      horizontalBias: Number(horizontalBias.toFixed(2)),
      circularBias: Number(circularBias.toFixed(2))
    };

    return {
      usable: true,
      quality: qualityResult,
      descriptors: visualDescriptorSet,
      stability: stabilityResult,
      candidate: {
        descriptors: stabilityResult.stableDescriptors.length > 0 ? stabilityResult.stableDescriptors : uniqueDescriptors,
        quality: qualityResult,
        stability: stabilityResult,
        matchConfidence,
        qualityLevel: matchConfidence >= 0.75 ? 'VERIFIED' : matchConfidence >= 0.5 ? 'PROMISING' : 'PARTIAL'
      }
    };
  }
}

export const onDeviceVision = new OnDeviceVisionDetector();
