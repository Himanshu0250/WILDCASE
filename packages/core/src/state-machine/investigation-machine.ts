import { Case, FieldReport, Suspect } from '../schema/case.schema.js';
import {
  DiscoveredEvidence,
  InvestigationSession,
  InvestigationStatus
} from '../schema/investigation.schema.js';
import { EvidenceMatcher, MatchResult } from '../predicates/matcher.js';

export type MachineEvent =
  | { type: 'SELECT_CASE'; caseData: Case }
  | { type: 'START_PREPARATION' }
  | { type: 'CONFIRM_PREPARED_ENTER_FIELD' }
  | { type: 'OPEN_CAMERA' }
  | { type: 'CLOSE_CAMERA' }
  | {
      type: 'SUBMIT_EVIDENCE';
      descriptors: string[];
      userObservationNote?: string;
      aiNarrative?: string;
    }
  | { type: 'REVEAL_HINT'; level: 1 | 2 | 3 | 4 }
  | { type: 'PROCEED_NEXT_BEAT' }
  | { type: 'OPEN_ACCUSATION' }
  | { type: 'SUBMIT_ACCUSATION'; suspectId: string }
  | { type: 'VIEW_REPORT' }
  | { type: 'UPDATE_VISIBILITY'; isVisible: boolean; timestamp?: number }
  | { type: 'ABANDON_CASE' };

export class InvestigationMachine {
  private session: InvestigationSession;

  constructor(sessionOrCase: InvestigationSession | Case) {
    if ('caseData' in sessionOrCase) {
      this.session = JSON.parse(JSON.stringify(sessionOrCase));
    } else {
      const caseData = sessionOrCase;
      const now = Date.now();
      this.session = {
        id: `inv-${now}-${Math.random().toString(36).substring(2, 7)}`,
        caseId: caseData.id,
        caseData,
        status: 'CASE_BRIEFING',
        currentBeatIndex: 0,
        discoveredEvidence: [],
        unlockedClues: [],
        eliminatedSuspects: [],
        activeHintsRevealed: {},
        screenMetrics: {
          startedAt: now,
          lastActiveTimestamp: now,
          isScreenActive: true,
          totalScreenTimeMs: 0,
          totalAwayTimeMs: 0,
          switchCount: 0
        }
      };
    }
  }

  public getSession(): InvestigationSession {
    return JSON.parse(JSON.stringify(this.session));
  }

  /**
   * Updates screen vs away time dynamically based on Page Visibility API events or tick intervals.
   */
  public updateVisibility(isVisible: boolean, timestamp: number = Date.now()): void {
    const metrics = this.session.screenMetrics;
    const elapsed = Math.max(0, timestamp - metrics.lastActiveTimestamp);

    if (metrics.isScreenActive) {
      metrics.totalScreenTimeMs += elapsed;
    } else {
      metrics.totalAwayTimeMs += elapsed;
    }

    if (metrics.isScreenActive !== isVisible) {
      metrics.switchCount += 1;
      metrics.isScreenActive = isVisible;
    }

    metrics.lastActiveTimestamp = timestamp;
  }

  /**
   * Main transition processor
   */
  public send(event: MachineEvent): { success: boolean; message?: string; matchResult?: MatchResult } {
    this.updateVisibility(this.session.screenMetrics.isScreenActive, Date.now());

    switch (event.type) {
      case 'START_PREPARATION': {
        if (this.session.status === 'CASE_BRIEFING') {
          this.session.status = 'PREPARING_FIELD';
          return { success: true };
        }
        return { success: false, message: `Cannot start preparation from state ${this.session.status}` };
      }

      case 'CONFIRM_PREPARED_ENTER_FIELD': {
        if (this.session.status === 'PREPARING_FIELD' || this.session.status === 'CASE_BRIEFING') {
          this.session.status = 'FIELD_SEARCHING';
          return { success: true };
        }
        return { success: false, message: `Cannot enter field mode from state ${this.session.status}` };
      }

      case 'OPEN_CAMERA': {
        if (this.session.status === 'FIELD_SEARCHING' || this.session.status === 'BEAT_REVEALED') {
          this.session.status = 'EVIDENCE_CAPTURING';
          return { success: true };
        }
        return { success: false, message: `Cannot open camera from state ${this.session.status}` };
      }

      case 'CLOSE_CAMERA': {
        if (this.session.status === 'EVIDENCE_CAPTURING') {
          this.session.status = 'FIELD_SEARCHING';
          return { success: true };
        }
        return { success: false, message: `Cannot close camera from state ${this.session.status}` };
      }

      case 'SUBMIT_EVIDENCE': {
        const currentBeat = this.session.caseData.beats[this.session.currentBeatIndex];
        if (!currentBeat) {
          return { success: false, message: 'No active beat' };
        }

        const match = EvidenceMatcher.evaluate(currentBeat.targetPredicate, event.descriptors);

        if (!match.isMatch) {
          return {
            success: false,
            message: match.feedback,
            matchResult: match
          };
        }

        // Valid match! Register discovered evidence
        const evidence: DiscoveredEvidence = {
          beatId: currentBeat.id,
          beatNumber: currentBeat.beatNumber,
          predicateId: currentBeat.targetPredicate.id,
          discoveredAt: Date.now(),
          matchedDescriptors: match.matchedRequired.concat(match.matchedOptional),
          confidenceScore: match.score,
          userObservationNote: event.userObservationNote,
          gmCommentary: event.aiNarrative || currentBeat.narrativeRevelation
        };

        this.session.discoveredEvidence.push(evidence);
        this.session.unlockedClues.push(currentBeat.clueCardTitle);

        // Add eliminated suspects
        for (const elimId of currentBeat.eliminatedSuspectIds) {
          if (!this.session.eliminatedSuspects.includes(elimId)) {
            this.session.eliminatedSuspects.push(elimId);
          }
        }

        this.session.status = 'BEAT_REVEALED';
        return {
          success: true,
          message: 'Evidence verified and bound to case file.',
          matchResult: match
        };
      }

      case 'PROCEED_NEXT_BEAT': {
        if (this.session.status !== 'BEAT_REVEALED') {
          return { success: false, message: 'Cannot proceed before resolving current beat.' };
        }

        if (this.session.currentBeatIndex < 3) {
          this.session.currentBeatIndex += 1;
          this.session.status = 'FIELD_SEARCHING';
          return { success: true };
        } else {
          // All 4 beats completed! Ready for accusation.
          this.session.status = 'ACCUSATION_PENDING';
          return { success: true, message: 'All 4 investigation beats completed. Proceed to Accusation.' };
        }
      }

      case 'REVEAL_HINT': {
        const currentBeat = this.session.caseData.beats[this.session.currentBeatIndex];
        if (!currentBeat) {
          return { success: false, message: 'No active beat for hint.' };
        }
        this.session.activeHintsRevealed[currentBeat.id] = event.level;
        return { success: true };
      }

      case 'OPEN_ACCUSATION': {
        if (this.session.discoveredEvidence.length >= 4 || this.session.status === 'ACCUSATION_PENDING') {
          this.session.status = 'ACCUSATION_PENDING';
          return { success: true };
        }
        return { success: false, message: 'Must discover all 4 pieces of evidence prior to accusation.' };
      }

      case 'SUBMIT_ACCUSATION': {
        if (this.session.status !== 'ACCUSATION_PENDING') {
          return { success: false, message: 'Session is not in accusation phase.' };
        }

        const isCorrect = event.suspectId === this.session.caseData.culpritId;
        const culprit = this.session.caseData.suspects.find((s) => s.id === this.session.caseData.culpritId);

        this.session.accusation = {
          accusedSuspectId: event.suspectId,
          accusedAt: Date.now(),
          isCorrect
        };

        const totalScreen = this.session.screenMetrics.totalScreenTimeMs;
        const totalAway = this.session.screenMetrics.totalAwayTimeMs;
        const totalDuration = totalScreen + totalAway || 1;
        const awayPercentage = Number(((totalAway / totalDuration) * 100).toFixed(1));

        let hintsUsed = 0;
        for (const key of Object.keys(this.session.activeHintsRevealed)) {
          hintsUsed += this.session.activeHintsRevealed[key] || 0;
        }

        const report: FieldReport = {
          caseId: this.session.caseId,
          caseNumber: this.session.caseData.caseNumber,
          title: this.session.caseData.title,
          culpritId: this.session.caseData.culpritId,
          culpritName: culprit ? culprit.name : 'Unknown Suspect',
          solved: isCorrect,
          totalDurationMs: totalDuration,
          screenDurationMs: totalScreen,
          awayDurationMs: totalAway,
          awayPercentage,
          evidenceFoundCount: this.session.discoveredEvidence.length,
          totalBeats: 4,
          hintsUsedCount: hintsUsed,
          timestamp: new Date().toISOString()
        };

        this.session.finalReport = report;
        this.session.status = 'VERDICT_REVEALED';
        return { success: true, message: isCorrect ? 'Case solved!' : 'Incorrect accusation.' };
      }

      case 'VIEW_REPORT': {
        if (this.session.status === 'VERDICT_REVEALED') {
          this.session.status = 'REPORT_READY';
          return { success: true };
        }
        return { success: false, message: 'Report is only accessible after verdict.' };
      }

      case 'UPDATE_VISIBILITY': {
        this.updateVisibility(event.isVisible, event.timestamp || Date.now());
        return { success: true };
      }

      case 'ABANDON_CASE': {
        this.session.status = 'ABANDONED';
        return { success: true };
      }

      default:
        return { success: false, message: 'Unhandled machine event.' };
    }
  }
}
