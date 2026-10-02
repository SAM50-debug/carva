import { Collection, ObjectId } from "mongodb";
import { getDb } from "../db/client";
import { FormTemplate } from "../db/models/types";

export class FormTemplateRepository {
  private async col(): Promise<Collection<FormTemplate>> {
    const db = await getDb();
    return db.collection<FormTemplate>("formTemplates");
  }

  /** Always returns the single active template */
  async getCurrent(): Promise<FormTemplate | null> {
    const col = await this.col();
    return col.findOne({}, { sort: { version: -1 } });
  }

  async save(data: Omit<FormTemplate, "_id">): Promise<FormTemplate> {
    const col = await this.col();
    // Upsert — there's only ever one template document
    const existing = await this.getCurrent();
    if (existing) {
      await col.updateOne(
        { _id: existing._id },
        { $set: { ...data, updatedAt: new Date() } }
      );
      return { ...existing, ...data };
    }
    const result = await col.insertOne(data as FormTemplate);
    return { ...data, _id: result.insertedId };
  }
}

export const formTemplateRepository = new FormTemplateRepository();
