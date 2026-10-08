import { Collection, Filter, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { Registration } from "../db/models/types";

export interface RegistrationFilter {
  search?: string;
  category?: string;
  eventId?: string;
  university?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export class RegistrationRepository {
  private async col(): Promise<Collection<Registration>> {
    const db = await getDb();
    return db.collection<Registration>("registrations");
  }

  async findAll(
    filters: RegistrationFilter = {}
  ): Promise<{ data: Registration[]; total: number }> {
    const col = await this.col();
    const { search, category, eventId, university, paymentStatus, page = 1, limit = 50 } = filters;

    const query: Filter<Registration> = {};

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { collegeName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.selectedCategories = category;
    if (eventId) query.selectedEvents = new ObjectId(eventId);
    if (university) query.collegeName = { $regex: university, $options: "i" };
    if (paymentStatus) query.paymentStatus = paymentStatus as Registration["paymentStatus"];

    const total = await col.countDocuments(query);
    const data = await col
      .find(query)
      .sort({ registeredAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return { data, total };
  }

  async findAllForExport(filters: Omit<RegistrationFilter, "page" | "limit"> = {}): Promise<Registration[]> {
    const { data } = await this.findAll({ ...filters, page: 1, limit: 99999 });
    return data;
  }

  async findById(id: string): Promise<Registration | null> {
    const col = await this.col();
    return col.findOne({ _id: new ObjectId(id) });
  }

  async findByQrCode(qrCode: string): Promise<Registration | null> {
    const col = await this.col();
    return col.findOne({ qrCode });
  }

  async create(data: Omit<Registration, "_id">): Promise<Registration> {
    const col = await this.col();
    const result = await col.insertOne(data as Registration);
    return { ...data, _id: result.insertedId };
  }

  async update(id: string, data: Partial<Registration>): Promise<void> {
    const col = await this.col();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async updatePaymentStatus(id: string, status: Registration["paymentStatus"]): Promise<void> {
    const col = await this.col();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { paymentStatus: status, updatedAt: new Date() } }
    );
  }

  async delete(id: string): Promise<void> {
    const col = await this.col();
    await col.deleteOne({ _id: new ObjectId(id) });
  }

  async ensureIndexes(): Promise<void> {
    const col = await this.col();
    await col.createIndex({ qrCode: 1 }, { unique: true });
    await col.createIndex({ email: 1 });
    await col.createIndex({ selectedCategories: 1 });
    await col.createIndex({ selectedEvents: 1 });
    await col.createIndex({ registeredAt: -1 });
  }
}

export const registrationRepository = new RegistrationRepository();
