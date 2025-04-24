import mongoose from "mongoose";
import { likeSchema } from "./like.schema.js";
import { ObjectId } from "mongodb";

const LikeModel = mongoose.model("Like", likeSchema);

export class likeRepository {

  async getLikes(type, ID) {
    return await LikeModel.find({
      likeable: new ObjectId(ID),
      types: type,
    })
      .populate("user")
      .populate({ path: "likeable", model: type });
  }

  async likeProduct(userID, productID) {
    try {
      const newLike = new LikeModel({
        user: new ObjectId(userID),
        likeable: new ObjectId(productID),
        types: "Product",
      });
      await newLike.save();
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }

  async likeCategory(userID, categoryID) {
    try {
      const newLike = new LikeModel({
        user: new ObjectId(userID),
        likable: new ObjectId(categoryID),
        types: "Category",
      });
      await newLike.save();
      return newLike;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }
}
