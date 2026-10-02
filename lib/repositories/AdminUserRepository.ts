import { Collection, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { AdminUser } from "../db/models/types";

export class AdminUserRepository {
  private async col(): Promise<Collection<AdminUser>> {
    const db = await getDb();
    return db.collection<AdminUser>("adminUsers");
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const col = await this.col();
    return col.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<AdminUser | null> {
    const col = await this.col();
    return col.findOne({ _id: new ObjectId(id) });
  }

  async findAll(): Promise<AdminUser[]> {
    const col = await this.col();
    return col.find({}).sort({ createdAt: -1 }).toArray();
  }

  async create(data: Omit<AdminUser, "_id">): Promise<AdminUser> {
    const col = await this.col();
    const result = await col.insertOne(data as AdminUser);
    return { ...data, _id: result.insertedId };
  }

  async update(id: string, data: Partial<AdminUser>): Promise<void> {
    const col = await this.col();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async updateLastLogin(id: string): Promise<void> {
    const col = await this.col();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLoginAt: new Date() } }
    );
  }

  async delete(id: string): Promise<void> {
    const col = await this.col();
    await col.deleteOne({ _id: new ObjectId(id) });
  }

  async ensureIndexes(): Promise<void> {
    const col = await this.col();
    await col.createIndex({ email: 1 }, { unique: true });
  }
}

export const adminUserRepository = new AdminUserRepository();
