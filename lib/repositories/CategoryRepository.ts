import { Collection, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { Category } from "../db/models/types";

export class CategoryRepository {
  private async col(): Promise<Collection<Category>> {
    const db = await getDb();
    return db.collection<Category>("categories");
  }

  async findAll(onlyActive = false): Promise<Category[]> {
    const col = await this.col();
    const filter = onlyActive ? { isActive: true } : {};
    return col.find(filter).sort({ order: 1 }).toArray();
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const col = await this.col();
    return col.findOne({ slug });
  }

  async findById(id: string): Promise<Category | null> {
    const col = await this.col();
    return col.findOne({ _id: new ObjectId(id) });
  }

  async create(data: Omit<Category, "_id">): Promise<Category> {
    const col = await this.col();
    const result = await col.insertOne(data as Category);
    return { ...data, _id: result.insertedId };
  }

  async update(id: string, data: Partial<Category>): Promise<void> {
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
    await col.createIndex({ order: 1 });
  }
}

export const categoryRepository = new CategoryRepository();
