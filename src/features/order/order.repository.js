import { getDB, getClient } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";
import OrderModel from "./order.model.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class OrderRepository {
  constructor() {
    this.collection = "orders";
  }

  async placeOrder(userID) {
    try {
      const client = getClient();
      const session = client.startSession();
      const db = getDB();
      session.startTransaction();
      // 1- Get cartitems and calculates total amount.
      const items = await this.getTotalAmount(userID, session);
      const finalTotalAmount = items.reduce(
        (acc, item) => acc + item.totalAmount,
        0
      );
      console.log(finalTotalAmount);

      // 2- Create an Order record .
      const newOrder = new OrderModel(
        new ObjectId(userID),
        finalTotalAmount,
        new Date()
      );
      await db.collection(this.collection).insertOne(newOrder, session);

      // 3- reduce the stocks.
      for (let item of items) {
        await db
          .collection("products")
          .updateOne(
            { _id: item.productID },
            { $inc: { stock: -item.quantity } },
            { session }
          );
      }
      throw new Error("Something is wrong in placeOrder");

      // 4- clear the cart.
      await db
        .collection("cartItems")
        .deleteMany({ userID: new ObjectId(userID) }, { session });
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }
  async getTotalAmount(userID, session) {
    const db = getDB();
    const items = await db
      .collection("cartItems")
      .aggregate(
        [
          // 1- get cardItems fro the user.
          {
            $match: { userID: new ObjectId(userID) },
          },

          // 2- Get the product from products collection.
          {
            $lookup: {
              from: "products",
              localField: "productID",
              foreignField: "_id",
              as: "productInfo",
            },
          },

          // 3- unwinding the productInfo array.
          {
            $unwind: "$productInfo",
          },

          // 4- calculate totalAmount for each cartItems
          {
            $addFields: {
              totalAmount: {
                $multiply: ["$productInfo.price", "$quantity"],
              },
            },
          },
        ],
        { session }
      )
      .toArray();
    return items;
  }
}
