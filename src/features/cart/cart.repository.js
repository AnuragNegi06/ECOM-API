import { getDB } from "../../config/mongodb.js";
import { ObjectId, ReturnDocument } from "mongodb";

class CartRepository {
  constructor() {
    this.collection = "cartItems";
  }
  async add(productID, userID, quantity) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      const id = await this.getNextCounter(db);
      // find the document
      //either and update
      //insertion if not found(upsert:true)
      await collection.updateOne(
        {
          //filter expression
          productID: new ObjectId(productID),
          userID: new ObjectId(userID),
        },
        {
          $setOnInsert: { _id: id },
          $inc: { quantity: quantity },
        },
        {
          upsert: true,
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async get(userID) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.find({ userID: new ObjectId(userID) }).toArray();
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }

  async delete(cartItemID, userID) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      const result = await collection.deleteOne({
        _id: Number(cartItemID),
        userID: new ObjectId(userID),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.log(error);
    }
  }

  async getNextCounter(db) {
    const resultDocument = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "cartItemID" },
        { $inc: { value: 1 } },
        { returnDocument: "after" }
      );
    console.log(resultDocument);
    return resultDocument.value;
  }
}

export default CartRepository;
