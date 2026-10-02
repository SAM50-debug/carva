import { Collection, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { AttendanceRecord } from "../db/models/types";

export class AttendanceRepository {
  private async col(): Promise<Collection<AttendanceRecord>> {
    const db = await getDb();
    return db.collection<AttendanceRecord>("attendance");
  }

  async findByEvent(eventId: string): Promise<AttendanceRecord[]> {
    const col = await this.col();
    return col
      .find({ eventId: new ObjectId(eventId) })
      .sort({ markedAt: -1 })
      .toArray();
  }

  async findByRegistrationAndEvent(
    registrationId: string,
    eventId: string
  ): Promise<AttendanceRecord | null> {
    const col = await this.col();
    return col.findOne({
      registrationId: new ObjectId(registrationId),
      eventId: new ObjectId(eventId),
    });
  }

  async upsert(data: Omit<AttendanceRecord, "_id">): Promise<AttendanceRecord> {
    const col = await this.col();
    const existing = await this.findByRegistrationAndEvent(
      data.registrationId.toString(),
      data.eventId.toString()
    );
    if (existing) {
      await col.updateOne(
        { _id: existing._id },
        { $set: { status: data.status, markedAt: data.markedAt, markedBy: data.markedBy, method: data.method } }
      );
      return { ...existing, ...data };
    }
    const result = await col.insertOne(data as AttendanceRecord);
    return { ...data, _id: result.insertedId };
  }

  async countByEvent(
    eventId: string
  ): Promise<{ present: number; absent: number; total: number }> {
    const col = await this.col();
    const [present, absent] = await Promise.all([
      col.countDocuments({ eventId: new ObjectId(eventId), status: "present" }),
      col.countDocuments({ eventId: new ObjectId(eventId), status: "absent" }),
    ]);
    return { present, absent, total: present + absent };
  }

  async ensureIndexes(): Promise<void> {
    const col = await this.col();
    await col.createIndex({ eventId: 1 });
    await col.createIndex({ registrationId: 1, eventId: 1 });
    await col.createIndex({ markedAt: -1 });
  }
}

export const attendanceRepository = new AttendanceRepository();
