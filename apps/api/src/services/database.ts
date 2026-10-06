import { MongoClient, Db } from 'mongodb';
import { Case, FieldReport, InvestigationSession } from '@wildcase/core';
import { logger } from './logger.js';
import case014 from '../../../../fixtures/case_014_the_silent_witness.json' with { type: 'json' };
import case007 from '../../../../fixtures/case_007_the_iron_cipher.json' with { type: 'json' };
import case022 from '../../../../fixtures/case_022_the_verdant_conspiracy.json' with { type: 'json' };

export interface ServerFieldReportDocument extends FieldReport {
  sessionId?: string;
  appVersion?: string;
  syncedAt?: string;
}

export class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  // In-memory fallback stores
  private memCases = new Map<string, Case>();
  private memInvestigations = new Map<string, InvestigationSession>();
  private memReports = new Map<string, ServerFieldReportDocument>();
  private memTelemetry = new Array<Record<string, unknown>>();

  constructor() {
    // Seed initial cases into memory
    this.saveCaseInMemory(case014 as unknown as Case);
    this.saveCaseInMemory(case007 as unknown as Case);
    this.saveCaseInMemory(case022 as unknown as Case);
  }

  public async connect(): Promise<boolean> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      logger.info('[Database] MONGODB_URI not set. Running with In-Memory Storage.');
      return false;
    }

    try {
      this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB_NAME || 'wildcase');
      this.isConnected = true;
      logger.info('[Database] Successfully connected to MongoDB Atlas.');

      // Ensure indexes for queries and idempotency
      const casesCol = this.db.collection('cases');
      await casesCol.createIndex({ id: 1 }, { unique: true });

      const invCol = this.db.collection('investigations');
      await invCol.createIndex({ id: 1 }, { unique: true });

      const reportsCol = this.db.collection('reports');
      await reportsCol.createIndex({ sessionId: 1 }, { unique: true, sparse: true });
      await reportsCol.createIndex({ caseId: 1 });

      // Seed curated cases to MongoDB if not existing
      for (const c of [case014, case007, case022]) {
        await casesCol.updateOne(
          { id: c.id },
          { $setOnInsert: c },
          { upsert: true }
        );
      }

      return true;
    } catch (err) {
      logger.warn({ err }, '[Database] Could not connect to MongoDB Atlas. Using In-Memory fallback.');
      this.isConnected = false;
      return false;
    }
  }

  public getStatus(): { connected: boolean; engine: 'mongodb' | 'in-memory'; databaseName: string } {
    return {
      connected: this.isConnected,
      engine: this.isConnected ? 'mongodb' : 'in-memory',
      databaseName: process.env.MONGODB_DB_NAME || 'wildcase'
    };
  }

  public async getCaseById(id: string): Promise<Case | null> {
    if (this.isConnected && this.db) {
      const doc = await this.db.collection<Case>('cases').findOne({ id });
      if (doc) return doc;
    }
    return this.memCases.get(id) || null;
  }

  public async getAllCases(): Promise<Case[]> {
    if (this.isConnected && this.db) {
      const docs = await this.db.collection<Case>('cases').find({}).toArray();
      if (docs.length > 0) return docs;
    }
    return Array.from(this.memCases.values());
  }

  public async saveCase(caseData: Case): Promise<void> {
    this.saveCaseInMemory(caseData);
    if (this.isConnected && this.db) {
      await this.db.collection('cases').updateOne(
        { id: caseData.id },
        { $set: caseData },
        { upsert: true }
      );
    }
  }

  private saveCaseInMemory(caseData: Case): void {
    this.memCases.set(caseData.id, caseData);
  }

  public async saveInvestigation(session: InvestigationSession): Promise<void> {
    this.memInvestigations.set(session.id, session);
    if (this.isConnected && this.db) {
      await this.db.collection('investigations').updateOne(
        { id: session.id },
        { $set: session },
        { upsert: true }
      );
    }
  }

  public async getInvestigation(id: string): Promise<InvestigationSession | null> {
    if (this.isConnected && this.db) {
      const doc = await this.db.collection<InvestigationSession>('investigations').findOne({ id });
      if (doc) return doc;
    }
    return this.memInvestigations.get(id) || null;
  }

  /**
   * Idempotently saves or updates a FieldReport in MongoDB Atlas.
   */
  public async saveFieldReport(report: ServerFieldReportDocument): Promise<void> {
    const key = report.sessionId || `${report.caseId}_${report.timestamp}`;
    const docWithSync = {
      ...report,
      sessionId: key,
      syncedAt: new Date().toISOString()
    };

    this.memReports.set(key, docWithSync);

    if (this.isConnected && this.db) {
      await this.db.collection('reports').updateOne(
        { sessionId: key },
        { $set: docWithSync },
        { upsert: true }
      );
    }
  }

  public async getAllFieldReports(): Promise<ServerFieldReportDocument[]> {
    if (this.isConnected && this.db) {
      return await this.db.collection<ServerFieldReportDocument>('reports').find({}).sort({ timestamp: -1 }).toArray();
    }
    return Array.from(this.memReports.values());
  }

  public async recordTelemetry(event: Record<string, unknown>): Promise<void> {
    this.memTelemetry.push({ ...event, recordedAt: new Date().toISOString() });
    if (this.isConnected && this.db) {
      await this.db.collection('telemetry').insertOne({ ...event, recordedAt: new Date() });
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
    }
  }
}

export const dbService = new DatabaseService();
