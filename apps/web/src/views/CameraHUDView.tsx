import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  X,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';
import { onDeviceVision } from '../vision/detector.js';
import { DevelopmentSensor, DEV_SENSOR_PRESETS } from '../vision/dev-sensor.js';
import { FrameQualityResult, MultiFrameStabilityResult } from '../vision/types.js';
import { EvidenceMatcher, MatchResult } from '@wildcase/core';

export const CameraHUDView: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeCase,
    session,
    closeCamera,
    verifyEvidence,
    isAIWorking,
    errorMessage
  } = useGameStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [extractedDescriptors, setExtractedDescriptors] = useState<string[]>([]);
  const [frameQuality, setFrameQuality] = useState<FrameQualityResult | null>(null);
  const [stabilityResult, setStabilityResult] = useState<MultiFrameStabilityResult | null>(null);
  const [matchConfidence, setMatchConfidence] = useState<number>(0.85);
  const [scanStep, setScanStep] = useState<'READY' | 'SAMPLING' | 'ANALYZING' | 'EVALUATED'>('READY');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [userNote, setUserNote] = useState('');
  const [manualSelection, setManualSelection] = useState<string[]>([]);
  const [isDevSensorOpen, setIsDevSensorOpen] = useState(false);
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);

  if (!activeCase || !session) return null;
  const currentBeat = activeCase.beats[session.currentBeatIndex];

  // Check if this beat was already logged
  useEffect(() => {
    const existingEvidence = session.discoveredEvidence.find(
      (e) => e.beatNumber === currentBeat.beatNumber
    );
    if (existingEvidence) {
      setIsAlreadyLogged(true);
    }
  }, [session, currentBeat]);

  // Initialize camera stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          console.warn('[CameraHUD] getUserMedia is not supported or blocked by Insecure Context (HTTP on non-localhost IP)');
          setHasCameraPermission(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.warn('[CameraHUD] Camera access error or denied:', err);
        setHasCameraPermission(false);
      }
    }

    startCamera();

    return () => {
      active = false;
      onDeviceVision.resetStabilityBuffer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Periodic frame analysis for HUD telemetry
  useEffect(() => {
    if (!hasCameraPermission || capturedSnapshot || scanStep !== 'READY') return;

    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const result = onDeviceVision.analyzeFrame(videoRef.current);
        setFrameQuality(result.quality);
        setStabilityResult(result.stability);
        setExtractedDescriptors(result.candidate.descriptors);
        setMatchConfidence(result.candidate.matchConfidence);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [hasCameraPermission, capturedSnapshot, scanStep]);

  // Cinematic Multi-Frame Capture & Evaluation Flow
  const handleCapture = async () => {
    setScanStep('SAMPLING');

    // 1. Multi-Frame Sampling sequence (3 frames spaced by 120ms)
    const samples: string[][] = [];
    for (let i = 0; i < 3; i++) {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const res = onDeviceVision.analyzeFrame(videoRef.current);
        samples.push(res.descriptors.descriptors);
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    setScanStep('ANALYZING');

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedSnapshot(dataUrl);

        const analysis = onDeviceVision.analyzeFrame(canvas);
        setFrameQuality(analysis.quality);
        setStabilityResult(analysis.stability);
        setExtractedDescriptors(analysis.candidate.descriptors);
        setMatchConfidence(analysis.candidate.matchConfidence);

        // Deterministic predicate check
        const evalResult = EvidenceMatcher.evaluate(
          currentBeat.targetPredicate,
          analysis.candidate.descriptors
        );
        setMatchResult(evalResult);
      }
    } else {
      // Fallback capture
      const fallbackResult = EvidenceMatcher.evaluate(
        currentBeat.targetPredicate,
        extractedDescriptors.length > 0 ? extractedDescriptors : ['outdoor']
      );
      setMatchResult(fallbackResult);
      setCapturedSnapshot('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%2315181d"><text x="50%" y="50%" fill="%23df9f28" font-size="16" text-anchor="middle">PHYSICAL EVIDENCE BOUND</text></svg>');
    }

    setScanStep('EVALUATED');
  };

  const handleDevPresetSelect = (presetId: string) => {
    const candidate = DevelopmentSensor.generateCandidate(presetId);
    setCapturedSnapshot('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%231a202c"><text x="50%" y="45%" fill="%2348bb78" font-size="14" text-anchor="middle">DEV SENSOR FIXTURE</text><text x="50%" y="58%" fill="%23a0aec0" font-size="12" text-anchor="middle">' + presetId + '</text></svg>');
    setExtractedDescriptors(candidate.descriptors);
    setFrameQuality(candidate.quality);
    setStabilityResult(candidate.stability);
    setMatchConfidence(candidate.matchConfidence);

    const evalResult = EvidenceMatcher.evaluate(currentBeat.targetPredicate, candidate.descriptors);
    setMatchResult(evalResult);
    setScanStep('EVALUATED');
    setIsDevSensorOpen(false);
  };

  const handleRetake = () => {
    onDeviceVision.resetStabilityBuffer();
    setCapturedSnapshot(null);
    setMatchResult(null);
    setScanStep('READY');
    setManualSelection([]);
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    closeCamera();
    navigate(`/case/${activeCase.id}/field`);
  };

  const handleBindAndVerify = async () => {
    const combined = Array.from(
      new Set([...extractedDescriptors, ...manualSelection])
    );

    if (combined.length === 0) {
      combined.push(...currentBeat.targetPredicate.requiredDescriptors);
    }

    const verified = await verifyEvidence(combined, userNote);
    if (verified) {
      navigate(`/case/${activeCase.id}/reveal`);
    }
  };

  const toggleManualTag = (tag: string) => {
    if (manualSelection.includes(tag)) {
      setManualSelection(manualSelection.filter((t) => t !== tag));
    } else {
      setManualSelection([...manualSelection, tag]);
    }
  };

  const availableTags = [
    'metal',
    'vertical',
    'circular',
    'weathered',
    'rough',
    'organic',
    'green',
    'stone',
    'sign',
    'bark',
    'rust',
    'soil',
    'bolt',
    'fastener',
    'leaf',
    'dark',
    'yellow'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-3 max-w-md mx-auto font-mono text-xs select-none">
      {/* Top Header Tactical Bar */}
      <div className="flex items-center justify-between text-case-paper z-20 bg-case-bg/90 backdrop-blur-md px-3 py-2 rounded-xl border border-case-border/60">
        <div className="flex items-center space-x-2">
          <span className="text-case-amber font-bold">{activeCase.caseNumber}</span>
          <span className="text-case-muted">•</span>
          <span className="text-case-cyan tracking-wider">LOCAL SENSOR HUD</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDevSensorOpen(!isDevSensorOpen)}
            className="px-2 py-1 bg-case-surface hover:bg-case-card border border-case-border text-[10px] text-case-cyan rounded flex items-center space-x-1"
          >
            <Cpu className="w-3 h-3" />
            <span>DEV SENSOR</span>
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 hover:text-case-amber rounded-lg bg-case-surface border border-case-border transition-colors"
            aria-label="Close sensor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Objective Directive */}
      <div className="z-20 bg-case-card/95 backdrop-blur-md border border-case-amber/40 px-3 py-2 rounded-xl space-y-0.5 my-1.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-case-amber font-bold uppercase tracking-wider">
            TARGET EVIDENCE: BEAT 0{currentBeat.beatNumber}
          </span>
          <span className="text-[10px] text-case-muted">
            REQ: [{currentBeat.targetPredicate.requiredDescriptors.join(' + ')}]
          </span>
        </div>
        <p className="font-serif text-xs font-bold text-case-paper">
          {currentBeat.targetPredicate.name}
        </p>
      </div>

      {/* Dev Sensor Fixtures Dropdown */}
      {isDevSensorOpen && (
        <div className="z-30 bg-case-bg border border-case-cyan/40 p-3 rounded-xl space-y-2 mb-2 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between text-[11px] text-case-cyan font-bold">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>DEVELOPMENT SENSOR FIXTURES</span>
            </span>
            <button onClick={() => setIsDevSensorOpen(false)} className="text-case-muted hover:text-case-paper">✕</button>
          </div>
          <p className="text-[10px] text-case-muted leading-tight font-sans">
            Simulates deterministic physical descriptors without camera stream.
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto pt-1">
            {DEV_SENSOR_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleDevPresetSelect(p.id)}
                className="w-full text-left p-2 rounded bg-case-surface hover:bg-case-card border border-case-border text-[10px] flex flex-col space-y-0.5"
              >
                <span className="text-case-paper font-bold">{p.name}</span>
                <span className="text-case-muted text-[9px]">Tags: {p.descriptors.join(', ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Center Viewport / Reticle */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-case-border flex items-center justify-center bg-case-surface min-h-[220px]">
        {hasCameraPermission === false ? (
          <div className="p-6 text-center space-y-3 max-w-xs">
            <AlertTriangle className="w-8 h-8 text-case-amber mx-auto" />
            <h3 className="font-serif text-sm font-bold text-case-paper">
              Optical Sensor Offline
            </h3>
            <p className="text-[11px] text-case-muted font-sans leading-relaxed">
              Camera access unavailable. Use manual descriptor confirmation or the Developer Sensor to bind evidence.
            </p>
          </div>
        ) : capturedSnapshot ? (
          <div className="relative w-full h-full">
            <img
              src={capturedSnapshot}
              alt="Captured evidence"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-case-bg/40 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-1">
              <span className="stamp-effect text-xs px-3 py-1 bg-case-bg/90 border-case-amber text-case-amber font-mono">
                PHOTO DISCARDED FROM STORAGE
              </span>
              <span className="text-[9px] text-case-muted font-mono">Descriptors Analyzed Locally</span>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
            {/* Tactical Caliper Reticles */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-5 h-5 border-t-2 border-l-2 border-case-amber"></div>
                <div className="w-5 h-5 border-t-2 border-r-2 border-case-amber"></div>
              </div>

              {/* Center Crosshairs */}
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-case-amber/40 animate-pulse"></div>
                <div className="absolute w-8 h-0.5 bg-case-amber/80"></div>
                <div className="absolute h-8 w-0.5 bg-case-amber/80"></div>
              </div>

              <div className="flex justify-between">
                <div className="w-5 h-5 border-b-2 border-l-2 border-case-amber"></div>
                <div className="w-5 h-5 border-b-2 border-r-2 border-case-amber"></div>
              </div>
            </div>
          </>
        )}

        {/* Telemetry Badge Overlay */}
        <div className="absolute top-2 left-2 z-20 flex items-center space-x-1.5 bg-case-bg/85 backdrop-blur-md px-2 py-1 rounded-md border border-case-border text-[9px]">
          <ShieldCheck className="w-3 h-3 text-case-cyan" />
          <span className="text-case-cyan font-bold">LOCAL ANALYSIS ONLY</span>
        </div>

        {frameQuality && (
          <div className="absolute bottom-2 right-2 z-20 bg-case-bg/85 backdrop-blur-md px-2 py-1 rounded-md border border-case-border text-[9px] text-case-muted">
            QUALITY: <span className="text-case-amber font-bold">{Math.round(frameQuality.quality * 100)}%</span>
            {stabilityResult && (
              <span className="ml-1.5">| STABLE: <span className="text-case-cyan">{stabilityResult.stableDescriptors.length}</span></span>
            )}
          </div>
        )}
      </div>

      {/* Analysis Panel & Match Feedback */}
      <div className="z-20 bg-case-bg/95 backdrop-blur-md border border-case-border rounded-xl p-3 mt-1.5 space-y-2.5 shadow-xl">
        {/* Match Result Banner */}
        {matchResult && (
          <div
            className={`p-2 rounded-lg border text-[11px] leading-tight flex items-start space-x-2 ${
              matchResult.isMatch
                ? 'bg-case-cyan/10 border-case-cyan/50 text-case-cyan'
                : matchResult.qualityLevel === 'PROMISING'
                ? 'bg-case-amber/10 border-case-amber/50 text-case-amber'
                : 'bg-case-red/10 border-case-red/50 text-case-red'
            }`}
          >
            {matchResult.isMatch ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-bold block uppercase tracking-wider">
                {matchResult.qualityLevel === 'VERIFIED'
                  ? 'EVIDENCE VERIFIED'
                  : matchResult.qualityLevel === 'PROMISING'
                  ? 'PROMISING CANDIDATE'
                  : 'INCONCLUSIVE EVIDENCE'}
              </span>
              <p className="font-sans text-[10px] opacity-90">{matchResult.feedback}</p>
            </div>
          </div>
        )}

        {/* Descriptor Tags */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-case-muted uppercase tracking-wider">
              EXTRACTED DESCRIPTORS:
            </span>
            <span className="text-case-amber font-bold">
              CONFIDENCE: {Math.round(matchConfidence * 100)}%
            </span>
          </div>

          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {availableTags.map((tag) => {
              const isDetected = extractedDescriptors.includes(tag);
              const isManual = manualSelection.includes(tag);
              const isSelected = isDetected || isManual;

              return (
                <button
                  key={tag}
                  onClick={() => toggleManualTag(tag)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
                    isSelected
                      ? 'bg-case-amber text-case-bg font-bold border-case-amber shadow-sm'
                      : 'bg-case-surface text-case-muted border-case-border hover:text-case-paper'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 pt-0.5">
          {capturedSnapshot ? (
            <>
              <button
                onClick={handleRetake}
                className="py-2.5 px-3 rounded-xl bg-case-surface hover:bg-case-card border border-case-border text-case-paper flex items-center justify-center space-x-1 transition-colors text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RETAKE</span>
              </button>

              <button
                onClick={handleBindAndVerify}
                disabled={isAIWorking}
                className={`flex-1 py-3 px-4 rounded-xl font-serif text-sm font-bold shadow-lg flex items-center justify-center space-x-2 transition-all ${
                  matchResult?.isMatch
                    ? 'bg-case-amber hover:bg-case-amberGlow text-case-bg shadow-case-amber/30'
                    : 'bg-case-surface hover:bg-case-card border border-case-border text-case-paper'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAIWorking ? 'ANALYZING...' : matchResult?.isMatch ? 'CONFIRM VERIFICATION' : 'SUBMIT CANDIDATE'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={scanStep === 'SAMPLING' || scanStep === 'ANALYZING'}
              className="w-full py-3.5 px-4 rounded-xl bg-case-amber hover:bg-case-amberGlow text-case-bg font-serif text-base font-bold shadow-xl shadow-case-amber/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>{scanStep === 'SAMPLING' ? 'HOLD STEADY (SAMPLING...)' : 'CAPTURE SCAN'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
