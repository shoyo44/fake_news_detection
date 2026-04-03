import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  var _truthGuardMongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._truthGuardMongoClientPromise) {
    client = new MongoClient(uri, options);
    global._truthGuardMongoClientPromise = client.connect();
  }
  clientPromise = global._truthGuardMongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getMongoDb() {
  const databaseName = process.env.MONGODB_DB;
  if (!databaseName) {
    throw new Error("MONGODB_DB is not configured");
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(databaseName);
}
