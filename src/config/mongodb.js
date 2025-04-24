import { MongoClient } from "mongodb";

let client;
export const connectToMongoDB = () => {
  MongoClient.connect(process.env.DB_URL)
    .then((clientInstance) => {
      client = clientInstance;
      console.log("Connected to MongoDB");
      createCounter(client.db());
      createIndexes(client.db());
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

export const getClient = () => {
  return client;
};

export const getDB = () => {
  return client.db();
};

// creating a counter for cardItemID
const createCounter = async (db) => {
  const existingCounter = await db
    .collection("counters")
    .findOne({ _id: "cartItemID" });
  if (!existingCounter) {
    await db.collection("counters").insertOne({ _id: "cartItemID", value: 0 });
  }
};

// creating indexes for the product collection.
const createIndexes = async (db) => {
  try {
    await db.collection("products").createIndex({ price: 1 }); // single field indexes.
    await db.collection("products").createIndex({ name: 1, category: -1 }); // compound field indexes.
    await db.collection("products").createIndex({ desc: "text" }); // text indexes.
  } catch (error) {
    Console.log(error);
  }
  console.log("Indexes are created");
};
