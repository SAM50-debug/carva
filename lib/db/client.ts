import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri) throw new Error("MONGODB_URI is not defined");
if (!dbName) throw new Error("MONGODB_DB_NAME is not defined");

// Global cache to reuse connection across hot-reloads in dev
const globalForMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
};

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri);
  }
  client = globalForMongo._mongoClient;
} else {
  client = new MongoClient(uri);
}

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(dbName);
}

export { client };
