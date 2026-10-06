import { create } from 'zustand';
import {
  Case,
  FieldReport,
  InvestigationMachine,
  InvestigationSession,
  VerdictResponse,
  WildcaseEngine
} from '@wildcase/core';
import { offlineDB } from '../db/offline-db.js';
import { tactileSynth } from '../audio/tactile-synth.js';
import { voiceNarrator } from '../audio/voice-narrator.js';
import case014 from '../../../../fixtures/case_014_the_silent_witness.json' with { type: 'json' };

export type AppView =
  | 'LANDING'
  | 'CASE_BRIEF'
  | 'PREPARE'
  | 'FIELD_MODE'
  | 'CAMERA_HUD'
  | 'REVEAL'
  | 'ACCUSE'
  | 'VERDICT'
  | 'FIELD_REPORT'
  | 'CASE_FILES'
  | 'SETTINGS'
  | 'PRIVACY_LEDGER';

interface GameState {
  currentView: AppView;
  activeCase: Case | null;
  machine: InvestigationMachine | null;
  session: InvestigationSession | null;
  allCases: Case[];
  allReports: FieldReport[];
  latestVerdict: VerdictResponse | null;
  latestNarrative: { title: string; commentary: string; clue: string; audioBase64?: string } | null;
  isMuted: boolean;
  isOnline: boolean;
  isAIWorking: boolean;
  activeHint: { level: number; text: string } | null;
  errorMessage: string | null;
  activeRecoverableSession: InvestigationSession | null;

  // Actions
  setView: (view: AppView) => void;
  loadCases: () => Promise<void>;
  checkRecoverableSession: () => Promise<void>;
  resumeRecoverableSession: () => void;
  abandonActiveSession: () => Promise<void>;
  selectCase: (caseData: Case) => void;
  generateNewCase: (envType?: Case['environmentType'], diff?: Case['difficulty']) => Promise<void>;
  startPreparation: () => void;
  confirmPreparedAndEnterField: () => void;
  openCamera: () => void;
  closeCamera: () => void;
  verifyEvidence: (candidateDescriptors: string[], userNote?: string) => Promise<boolean>;
  proceedNextBeat: () => void;
  requestHint: (level: 1 | 2 | 3 | 4) => Promise<void>;
  submitAccusation: (suspectId: string) => Promise<void>;
  viewReport: () => void;
  toggleMute: () => void;
  updateVisibilityTick: (isVisible: boolean, now: number) => void;
  clearError: () => void;
  resetToHome: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentView: 'LANDING',
  activeCase: case014 as unknown as Case,
  machine: null,
  session: null,
  allCases: [],
  allReports: [],
  latestVerdict: null,
  latestNarrative: null,
  isMuted: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isAIWorking: false,
  activeHint: null,
  errorMessage: null,
  activeRecoverableSession: null,

  setView: (view) => {
    tactileSynth.playPaperRustle();
    set({ currentView: view });
  },

  loadCases: async () => {
    const cases = await offlineDB.getAvailableCases();
    const reports = await offlineDB.getAllReports();
    const recoverable = await offlineDB.getLatestActiveSession();
    set({ allCases: cases, allReports: reports, activeRecoverableSession: recoverable });
  },

  checkRecoverableSession: async () => {
    const recoverable = await offlineDB.getLatestActiveSession();
    set({ activeRecoverableSession: recoverable });
  },

  resumeRecoverableSession: () => {
    const { activeRecoverableSession } = get();
    if (!activeRecoverableSession) return;

    const machine = new InvestigationMachine(activeRecoverableSession);
    const session = machine.getSession();

    let targetView: AppView = 'FIELD_MODE';
    if (session.status === 'CASE_BRIEFING') targetView = 'CASE_BRIEF';
    else if (session.status === 'PREPARING_FIELD') targetView = 'PREPARE';
    else if (session.status === 'ACCUSATION_PENDING') targetView = 'ACCUSE';
    else if (session.status === 'BEAT_REVEALED') targetView = 'REVEAL';

    tactileSynth.playSonarPing();
    set({
      activeCase: session.caseData,
      machine,
      session,
      currentView: targetView,
      activeRecoverableSession: null
    });
  },

  abandonActiveSession: async () => {
    const { session, activeRecoverableSession } = get();
    const idToAbandon = session?.id || activeRecoverableSession?.id;
    if (idToAbandon) {
      await offlineDB.deleteActiveSession(idToAbandon);
    }
    get().resetToHome();
    set({ activeRecoverableSession: null });
  },

  selectCase: (caseData: Case) => {
    tactileSynth.playPaperRustle();
    const machine = WildcaseEngine.createSession(caseData);
    const session = machine.getSession();
    set({
      activeCase: caseData,
      machine,
      session,
      currentView: 'CASE_BRIEF',
      activeHint: null,
      latestNarrative: null,
      latestVerdict: null,
      activeRecoverableSession: null
    });
    offlineDB.saveActiveSession(session).catch(() => {});
  },

  generateNewCase: async (envType = 'park_green', diff = '3') => {
    set({ isAIWorking: true, errorMessage: null });
    try {
      let generatedCase: Case | null = null;
      if (navigator.onLine) {
        try {
          const res = await fetch('/api/cases/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ environmentType: envType, difficulty: diff })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.case) generatedCase = data.case;
          }
        } catch (err) {
          console.warn('[Store] Remote case generation failed, using local offline generator:', err);
        }
      }

      if (!generatedCase) {
        // Local generator
        const { FallbackProvider } = await import('@wildcase/ai');
        const fallback = new FallbackProvider();
        generatedCase = await fallback.generateCase({ environmentType: envType, difficulty: diff, estimatedMinutes: 25 });
      }

      await offlineDB.saveCase(generatedCase);
      const allCases = await offlineDB.getAvailableCases();
      get().selectCase(generatedCase);
      set({ allCases, isAIWorking: false });
    } catch (err) {
      set({
        isAIWorking: false,
        errorMessage: 'Unable to generate case. Check your connection or pick an offline file.'
      });
    }
  },

  startPreparation: () => {
    const { machine } = get();
    if (!machine) return;
    machine.send({ type: 'START_PREPARATION' });
    tactileSynth.playPaperRustle();
    set({ session: machine.getSession(), currentView: 'PREPARE' });
  },

  confirmPreparedAndEnterField: () => {
    const { machine } = get();
    if (!machine) return;
    machine.send({ type: 'CONFIRM_PREPARED_ENTER_FIELD' });
    tactileSynth.playSonarPing();
    const session = machine.getSession();
    set({ session, currentView: 'FIELD_MODE' });
    offlineDB.saveActiveSession(session).catch(() => {});
  },

  openCamera: () => {
    const { machine } = get();
    if (machine) {
      machine.send({ type: 'OPEN_CAMERA' });
      set({ session: machine.getSession() });
    }
    tactileSynth.playShutterClick();
    set({ currentView: 'CAMERA_HUD', errorMessage: null });
  },

  closeCamera: () => {
    const { machine } = get();
    if (machine) {
      machine.send({ type: 'CLOSE_CAMERA' });
      set({ session: machine.getSession() });
    }
    set({ currentView: 'FIELD_MODE' });
  },

  verifyEvidence: async (candidateDescriptors: string[], userNote?: string) => {
    const { machine, session, activeCase } = get();
    if (!machine || !session || !activeCase) return false;

    set({ isAIWorking: true, errorMessage: null });
    const currentBeat = activeCase.beats[session.currentBeatIndex];

    // Duplicate detection
    const alreadyLogged = session.discoveredEvidence.some(
      (e) => e.beatNumber === currentBeat.beatNumber
    );
    if (alreadyLogged) {
      set({
        isAIWorking: false,
        errorMessage: 'Evidence for this beat is already logged. Look for something new.'
      });
      return false;
    }

    try {
      let matchSuccess = false;
      let commentary = currentBeat.narrativeRevelation;
      let deductionClue = 'Clue logged to notebook.';
      let audioBase64: string | undefined;

      // Online API evaluation
      if (navigator.onLine) {
        try {
          const res = await fetch('/api/evidence/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caseId: activeCase.id,
              beatIndex: session.currentBeatIndex,
              candidateDescriptors,
              userObservationNote: userNote
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.matchResult.isMatch) {
              matchSuccess = true;
              commentary = data.interpretation.gmCommentary;
              deductionClue = data.interpretation.deductionClue;
              if (data.audio?.audioBase64) {
                audioBase64 = data.audio.audioBase64;
              }
            } else if (!data.matchResult?.isMatch) {
              set({
                isAIWorking: false,
                errorMessage: data.matchResult?.feedback || 'Evidence does not match target predicate.'
              });
              return false;
            }
          }
        } catch (err) {
          console.warn('[Store] Online verification failed, using on-device matcher:', err);
        }
      }

      // Offline deterministic check
      if (!matchSuccess) {
        const result = machine.send({
          type: 'SUBMIT_EVIDENCE',
          descriptors: candidateDescriptors,
          userObservationNote: userNote,
          aiNarrative: commentary
        });

        if (!result.success) {
          set({
            isAIWorking: false,
            errorMessage: result.message || 'Evidence mismatch. Inspect surroundings and try again.'
          });
          return false;
        }
        matchSuccess = true;
      } else {
        machine.send({
          type: 'SUBMIT_EVIDENCE',
          descriptors: candidateDescriptors,
          userObservationNote: userNote,
          aiNarrative: commentary
        });
      }

      tactileSynth.playClueUnlocked();
      tactileSynth.playStampThud();

      const updatedSession = machine.getSession();
      set({
        session: updatedSession,
        currentView: 'REVEAL',
        isAIWorking: false,
        activeHint: null,
        latestNarrative: {
          title: `BEAT ${currentBeat.beatNumber}: ${currentBeat.title}`,
          commentary,
          clue: deductionClue,
          audioBase64
        }
      });

      // Play audio narration
      if (commentary) {
        voiceNarrator.playVoiceover(commentary, audioBase64);
      }

      await offlineDB.saveActiveSession(updatedSession);
      return true;
    } catch (err) {
      set({
        isAIWorking: false,
        errorMessage: 'An error occurred while verifying evidence.'
      });
      return false;
    }
  },

  proceedNextBeat: () => {
    const { machine } = get();
    if (!machine) return;

    voiceNarrator.stop();
    const result = machine.send({ type: 'PROCEED_NEXT_BEAT' });
    const session = machine.getSession();

    if (session.status === 'ACCUSATION_PENDING') {
      tactileSynth.playPaperRustle();
      set({ session, currentView: 'ACCUSE' });
    } else {
      tactileSynth.playSonarPing();
      set({ session, currentView: 'FIELD_MODE', activeHint: null });
    }

    offlineDB.saveActiveSession(session).catch(() => {});
  },

  requestHint: async (level: 1 | 2 | 3 | 4) => {
    const { machine, session, activeCase } = get();
    if (!machine || !session || !activeCase) return;

    const currentBeat = activeCase.beats[session.currentBeatIndex];
    let hintText =
      level <= 3
        ? currentBeat.hintLevels[`level${level}` as keyof typeof currentBeat.hintLevels]
        : `Strong deduction lead: Inspect public fixtures near path transitions for ${currentBeat.targetPredicate.name}.`;

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/hints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: activeCase.id,
            beatIndex: session.currentBeatIndex,
            hintLevel: level
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hint?.hintText) hintText = data.hint.hintText;
        }
      } catch {}
    }

    machine.send({ type: 'REVEAL_HINT', level });
    tactileSynth.playPaperRustle();
    set({
      session: machine.getSession(),
      activeHint: { level, text: hintText }
    });
  },

  submitAccusation: async (suspectId: string) => {
    const { machine, activeCase, session } = get();
    if (!machine || !activeCase || !session) return;

    set({ isAIWorking: true });
    tactileSynth.playStampThud();

    let verdictData: VerdictResponse | null = null;
    let fieldReport: FieldReport | null = null;

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: activeCase.id,
            accusedSuspectId: suspectId,
            screenDurationMs: session.screenMetrics.totalScreenTimeMs,
            awayDurationMs: session.screenMetrics.totalAwayTimeMs,
            hintsUsedCount: Object.values(session.activeHintsRevealed).reduce((a, b) => a + b, 0)
          })
        });
        if (res.ok) {
          const data = await res.json();
          verdictData = data.verdict;
          fieldReport = data.fieldReport;
        }
      } catch (err) {
        console.warn('[Store] Online solve failed, evaluating offline:', err);
      }
    }

    if (!verdictData) {
      machine.send({ type: 'SUBMIT_ACCUSATION', suspectId });
      verdictData = WildcaseEngine.evaluateAccusation(activeCase, suspectId);
      fieldReport = machine.getSession().finalReport || null;
    } else {
      machine.send({ type: 'SUBMIT_ACCUSATION', suspectId });
    }

    if (fieldReport) {
      await offlineDB.saveFieldReport(fieldReport);
    }

    const updatedSession = machine.getSession();
    const reports = await offlineDB.getAllReports();

    set({
      session: updatedSession,
      latestVerdict: verdictData,
      allReports: reports,
      currentView: 'VERDICT',
      isAIWorking: false
    });

    if (verdictData?.audioNarration) {
      voiceNarrator.playVoiceover(verdictData.audioNarration);
    }
  },

  viewReport: () => {
    const { machine } = get();
    if (machine) {
      machine.send({ type: 'VIEW_REPORT' });
      set({ session: machine.getSession() });
    }
    tactileSynth.playStampThud();
    set({ currentView: 'FIELD_REPORT' });
  },

  toggleMute: () => {
    const next = !get().isMuted;
    tactileSynth.setMuted(next);
    voiceNarrator.setMuted(next);
    set({ isMuted: next });
  },

  updateVisibilityTick: (isVisible: boolean, now: number) => {
    const { machine } = get();
    if (machine) {
      machine.updateVisibility(isVisible, now);
      set({ session: machine.getSession() });
    }
  },

  clearError: () => set({ errorMessage: null }),

  resetToHome: () => {
    voiceNarrator.stop();
    tactileSynth.playPaperRustle();
    set({
      currentView: 'LANDING',
      activeCase: null,
      machine: null,
      session: null,
      activeHint: null,
      latestVerdict: null,
      latestNarrative: null,
      errorMessage: null
    });
  }
}));
