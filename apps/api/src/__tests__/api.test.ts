import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../index.js';
import { dbService } from '../services/database.js';

describe('WILDCASE API Integration Tests', () => {
  before(async () => {
    // In-memory setup
  });

  after(async () => {
    await dbService.close();
  });

  it('GET /health returns 200 and standard render status', async () => {
    const res = await app.request('/health');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string; service: string };
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'wildcase-api');
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await app.request('/api/health');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string; service: string; database: unknown };
    assert.equal(body.status, 'healthy');
    assert.equal(body.service, 'wildcase-api');
    assert.ok(body.database);
  });

  it('GET /api/cases lists pre-seeded cases', async () => {
    const res = await app.request('/api/cases');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { count: number; cases: Array<{ id: string }> };
    assert.ok(body.count >= 3);
    assert.ok(body.cases.some((c) => c.id === 'case-014'));
  });

  it('GET /api/cases/case-014 retrieves The Silent Witness', async () => {
    const res = await app.request('/api/cases/case-014');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; case: { title: string; beats: unknown[] } };
    assert.equal(body.success, true);
    assert.equal(body.case.title, 'The Silent Witness');
    assert.equal(body.case.beats.length, 4);
  });

  it('POST /api/evidence/verify verifies matching descriptors and returns AI commentary', async () => {
    const res = await app.request('/api/evidence/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-014',
        beatIndex: 0,
        candidateDescriptors: ['metal', 'vertical', 'fence']
      })
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      success: boolean;
      matchResult: { isMatch: boolean; qualityLevel: string };
      interpretation: { narrativeTitle: string; gmCommentary: string };
    };
    assert.equal(body.success, true);
    assert.equal(body.matchResult.isMatch, true);
    assert.equal(body.matchResult.qualityLevel, 'VERIFIED');
    assert.ok(body.interpretation.gmCommentary.length > 5);
  });

  it('POST /api/hints returns structured progressive hint', async () => {
    const res = await app.request('/api/hints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-014',
        beatIndex: 1,
        hintLevel: 2
      })
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; hint: { hintLevel: number; hintText: string } };
    assert.equal(body.success, true);
    assert.equal(body.hint.hintLevel, 2);
    assert.ok(body.hint.hintText.length > 5);
  });

  it('POST /api/solve evaluates accusation and produces Field Report with sessionId', async () => {
    const res = await app.request('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'session_test_014',
        caseId: 'case-014',
        accusedSuspectId: 'suspect-b', // Arthur Pendelton (correct)
        screenDurationMs: 80000,
        awayDurationMs: 1200000,
        hintsUsedCount: 1
      })
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      success: boolean;
      sessionId: string;
      verdict: { isCorrect: boolean; culpritName: string };
      fieldReport: { solved: boolean; awayPercentage: number };
    };
    assert.equal(body.success, true);
    assert.equal(body.sessionId, 'session_test_014');
    assert.equal(body.verdict.isCorrect, true);
    assert.equal(body.verdict.culpritName, 'Arthur Pendelton');
    assert.ok(body.fieldReport.awayPercentage > 90);
  });

  it('POST /api/solve/sync idempotently syncs offline queued reports', async () => {
    const res = await app.request('/api/solve/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reports: [
          {
            sessionId: 'offline_session_1',
            caseId: 'case-007',
            caseNumber: 'CASE 007',
            title: 'The Iron Cipher',
            culpritId: 'suspect-a',
            culpritName: 'Darius Thorne',
            solved: true,
            totalDurationMs: 1500000,
            screenDurationMs: 200000,
            awayDurationMs: 1300000,
            awayPercentage: 86.7,
            evidenceFoundCount: 4,
            totalBeats: 4,
            hintsUsedCount: 0,
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; syncedCount: number };
    assert.equal(body.success, true);
    assert.equal(body.syncedCount, 1);
  });
});
