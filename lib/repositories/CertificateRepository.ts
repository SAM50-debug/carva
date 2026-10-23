import { Collection, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { CertificateRecord, EventResultDoc } from "../db/models/types";

export class CertificateRepository {
  private async certCol(): Promise<Collection<CertificateRecord>> {
    const db = await getDb();
    return db.collection<CertificateRecord>("certificates");
  }

  private async resultsCol(): Promise<Collection<EventResultDoc>> {
    const db = await getDb();
    return db.collection<EventResultDoc>("event_results");
  }

  // --- Certificates ---

  async findByCertificateId(certificateId: string): Promise<CertificateRecord | null> {
    const col = await this.certCol();
    return col.findOne({ certificateId });
  }

  async findExistingCertificate(
    registrationId: ObjectId,
    eventId: string,
    studentName: string
  ): Promise<CertificateRecord | null> {
    const col = await this.certCol();
    // Case-insensitive name match to avoid duplicate issuance on slight casing diffs
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return col.findOne({
      registrationId,
      eventId,
      studentName: { $regex: new RegExp(`^${escapeRegex(studentName.trim())}$`, "i") },
    });
  }

  async createCertificate(data: Omit<CertificateRecord, "_id">): Promise<CertificateRecord> {
    const col = await this.certCol();
    const res = await col.insertOne(data as CertificateRecord);
    return { ...data, _id: res.insertedId };
  }

  async incrementDownloadCount(certificateId: string): Promise<void> {
    const col = await this.certCol();
    await col.updateOne(
      { certificateId },
      {
        $inc: { downloadCount: 1 },
        $set: { lastDownloadedAt: new Date() },
      }
    );
  }

  // --- Event Results (Winners) ---

  async findResultByEventId(eventId: string): Promise<EventResultDoc | null> {
    const col = await this.resultsCol();
    return col.findOne({ eventId });
  }

  async findAllResults(): Promise<EventResultDoc[]> {
    const col = await this.resultsCol();
    return col.find().sort({ eventName: 1 }).toArray();
  }

  async saveEventResult(result: Omit<EventResultDoc, "_id" | "updatedAt">): Promise<EventResultDoc> {
    const col = await this.resultsCol();
    const now = new Date();
    const { publishedAt, ...fieldsToSet } = result;

    await col.updateOne(
      { eventId: result.eventId },
      {
        $set: {
          ...fieldsToSet,
          updatedAt: now,
        },
        $setOnInsert: {
          publishedAt: publishedAt || now,
        },
      },
      { upsert: true }
    );
    const updated = await col.findOne({ eventId: result.eventId });
    return updated!;
  }

  // --- Index initialization ---
  async ensureIndexes(): Promise<void> {
    const certs = await this.certCol();
    await certs.createIndex({ certificateId: 1 }, { unique: true });
    await certs.createIndex({ registrationId: 1, eventId: 1 });
    await certs.createIndex({ mobile: 1 });

    const results = await this.resultsCol();
    await results.createIndex({ eventId: 1 }, { unique: true });
  }
}

export const certificateRepository = new CertificateRepository();
