import Dexie, { type EntityTable } from 'dexie';
import { Case, FieldReport, InvestigationSession } from '@wildcase/core';
import case014 from '../../../../fixtures/case_014_the_silent_witness.json' with { type: 'json' };
import case007 from '../../../../fixtures/case_007_the_iron_cipher.json' with { type: 'json' };
import case022 from '../../../../fixtures/case_022_the_verdant_conspiracy.json' with { type: 'json' };

export interface CachedCaseRecord {
  id: string;
  data: Case;
  cachedAt: number;
}

export interface OfflineInvestigationRecord {
  id: string;
  caseId: string;
  data: InvestigationSession;
  updatedAt: number;
}

export interface SyncQueueEvent {
  id?: number;
  type: string;
  payload: Record<string, unknown>;
  queuedAt: number;
}

class WildcaseOfflineDB extends Dexie {
  cases!: EntityTable<CachedCaseRecord, 'id'>;
  investigations!: EntityTable<OfflineInvestigationRecord, 'id'>;
  fieldReports!: EntityTable<FieldReport, 'caseId'>;
  syncQueue!: EntityTable<SyncQueueEvent, 'id'>;

  constructor() {
    super('WildcaseDB');
    this.version(1).stores({
      cases: 'id, cachedAt',
      investigations: 'id, caseId, updatedAt',
      fieldReports: 'caseId, timestamp, solved',
      syncQueue: '++id, type, queuedAt'
    });
  }

  /**
   * Pre-populates default curated cases into IndexedDB for offline play
   */
  public async seedDefaultCases(): Promise<void> {
    const existing = await this.cases.count();
    if (existing === 0) {
      const fixtures = [case014, case007, case022];
      const now = Date.now();
      for (const f of fixtures) {
        await this.cases.put({
          id: f.id,
          data: f as unknown as Case,
          cachedAt: now
        });
      }
    }
  }

  public async getAvailableCases(): Promise<Case[]> {
    await this.seedDefaultCases();
    const records = await this.cases.toArray();
    return records.map((r) => r.data);
  }

  public async saveCase(c: Case): Promise<void> {
    await this.cases.put({
      id: c.id,
      data: c,
      cachedAt: Date.now()
    });
  }

  public async saveActiveSession(session: InvestigationSession): Promise<void> {
    await this.investigations.put({
      id: session.id,
      caseId: session.caseId,
      data: session,
      updatedAt: Date.now()
    });
  }

  public async getActiveSession(id: string): Promise<InvestigationSession | null> {
    const rec = await this.investigations.get(id);
    return rec ? rec.data : null;
  }

  public async getLatestActiveSession(): Promise<InvestigationSession | null> {
    const records = await this.investigations.orderBy('updatedAt').reverse().toArray();
    const active = records.find(
      (r) =>
        r.data.status !== 'VERDICT_REVEALED' &&
        r.data.status !== 'REPORT_READY' &&
        r.data.status !== 'ABANDONED'
    );
    return active ? active.data : null;
  }

  public async deleteActiveSession(id: string): Promise<void> {
    await this.investigations.delete(id);
  }

  public async saveFieldReport(report: FieldReport): Promise<void> {
    await this.fieldReports.put(report);
  }

  public async getAllReports(): Promise<FieldReport[]> {
    return await this.fieldReports.reverse().toArray();
  }

  public async clearAllData(): Promise<void> {
    await this.cases.clear();
    await this.investigations.clear();
    await this.fieldReports.clear();
    await this.syncQueue.clear();
    await this.seedDefaultCases();
  }
}

export const offlineDB = new WildcaseOfflineDB();
// Auto-seed on load
offlineDB.seedDefaultCases().catch(() => {});
