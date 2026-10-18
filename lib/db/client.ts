import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri) throw new Error("MONGODB_URI is not defined");
if (!dbName) throw new Error("MONGODB_DB_NAME is not defined");

// Global cache to reuse connection pool across hot-reloads and serverless invocations
const globalForMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalForMongo._mongoClientPromise) {
  client = new MongoClient(uri, mongoOptions);
  globalForMongo._mongoClient = client;
  globalForMongo._mongoClientPromise = client.connect();
}

client = globalForMongo._mongoClient!;
clientPromise = globalForMongo._mongoClientPromise!;

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export { client, clientPromise };
