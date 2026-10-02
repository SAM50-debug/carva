import { Collection, Filter, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { EventDoc } from "../db/models/types";

export class EventRepository {
  private async col(): Promise<Collection<EventDoc>> {
    const db = await getDb();
    return db.collection<EventDoc>("events");
  }

  /** Super admin sees all; sub-admin sees only assigned events */
  async findForAdmin(
    role: string,
    assignedEventIds: string[]
  ): Promise<EventDoc[]> {
    const col = await this.col();
    const filter: Filter<EventDoc> =
      role === "super_admin"
        ? {}
        : { _id: { $in: assignedEventIds.map((id) => new ObjectId(id)) } };
    return col.find(filter).sort({ categoryId: 1, name: 1 }).toArray();
  }

  async findAll(onlyActive = false): Promise<EventDoc[]> {
    const col = await this.col();
    const filter = onlyActive ? { isActive: true } : {};
    return col.find(filter).sort({ name: 1 }).toArray();
  }

  async findByCategory(categoryId: string): Promise<EventDoc[]> {
    const col = await this.col();
    return col
      .find({ categoryId: new ObjectId(categoryId) })
      .sort({ name: 1 })
      .toArray();
  }

  async findBySlug(slug: string): Promise<EventDoc | null> {
    const col = await this.col();
    return col.findOne({ slug });
  }

  async findById(id: string): Promise<EventDoc | null> {
    const col = await this.col();
    return col.findOne({ _id: new ObjectId(id) });
  }

  async create(data: Omit<EventDoc, "_id">): Promise<EventDoc> {
    const col = await this.col();
    const result = await col.insertOne(data as EventDoc);
    return { ...data, _id: result.insertedId };
  }

  async update(id: string, data: Partial<EventDoc>): Promise<void> {
    const col = await this.col();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async delete(id: string): Promise<void> {
    const col = await this.col();
    await col.deleteOne({ _id: new ObjectId(id) });
  }

  async ensureIndexes(): Promise<void> {
    const col = await this.col();
    await col.createIndex({ slug: 1 }, { unique: true });
    await col.createIndex({ categoryId: 1 });
  }
}

export const eventRepository = new EventRepository();
