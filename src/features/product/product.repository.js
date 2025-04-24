import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import mongoose from "mongoose";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

const ProductModel = mongoose.model("Product", productSchema);
const ReviewModel = mongoose.model("Review", reviewSchema);
const CategoryModel = mongoose.model("Category", categorySchema);

class ProductRepository {
  constructor() {
    this.collection = "products";
  }
  async add(productData) {
    try {
      //1. add the product.

      productData.categories = productData.category
        .split(",")
        .map((e) => e.trim());
      console.log(productData);
      const newProduct = new ProductModel(productData);
      const saveProduct = await newProduct.save();

      // 2.update categories.
      await CategoryModel.updateMany(
        { _id: { $in: productData.categories } },
        { $push: { products: new ObjectId(saveProduct._id) } } //in product array we pushing the saveProducts ID for all categories.
      );
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }
  async getAll() {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.find().toArray();
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async get(id) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }

  async filter(minPrice, categories) {
    //  maxPrice,
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      let filterExpression = {};
      if (minPrice) {
        filterExpression.price = { $gte: parseFloat(minPrice) };
      }
      // if (maxPrice) {
      //   filterExpression.price = {
      //     ...filterExpression.price,
      //     $lte: parseFloat(maxPrice),
      //   };
      // }
      categories = JSON.parse(categories.replace(/'/g, '"'));
      if (categories) {
        filterExpression = {
          $or: [{ category: { $in: categories } }, filterExpression],
        }; // $in ->  it is used to match any of the specified value between (given categories).
        // filterExpression.category = category;
      }
      return await collection
        .find(filterExpression)
        .project({
          name: 1,
          price: 1,
          _id: 0,
          category: 1,
          ratings: { $slice: 1 }, // $slice -> to limit the no. of elements in an array.
        })
        .toArray(); // project() -> to select the fields to be returned.
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }

  //using mongoose
  // for race condition
  async rate(userID, productID, rating) {
    try {
      // 1- check if product exist
      const productToUpdate = await ProductModel.findById(productID);
      if (!productToUpdate) {
        throw new Error("Product not found");
      }
      // 2- Get the existing review
      const userReview = await ReviewModel.findOne({
        product: new ObjectId(productID),
        user: new ObjectId(userID),
      });
      if (userReview) {
        userReview.rating = rating;
        await userReview.save();
      } else {
        const newReview = new ReviewModel({
          productL: new ObjectId(productID),
          user: new ObjectId(userID),
          rating: rating,
        });
        await newReview.save();
      }
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }

  //using mongoDB

  // async rate(userID, productID, rating) {
  //   try {
  //     const db = getDB();
  //     const collection = db.collection(this.collection);
  //     //1- remove existing entry
  //     await collection.updateOne(
  //       {
  //         _id: new ObjectId(productID),
  //       },
  //       {
  //         $pull: { ratings: { userID: new ObjectId(usreID) } },
  //       }
  //     );

  //     //2- add new entry
  //     await collection.updateOne(
  //       { _id: new ObjectId(productID) },
  //       { $push: { ratings: { userID, rating } } }
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     throw new ApplicationError("Something went wrong ", 500);
  //   }
  // }

  // async rate(userID, productID, rating) {
  //   try {
  //     const db = getDB();
  //     const collection = db.collection(this.collection);
  //     //1- Find the product
  //     const product = await collection.findOne({
  //       _id: new ObjectId(productID),
  //     });

  //     // 2- check if the user has already rated the product
  //     const userRating = product?.ratintgs?.find((r) => r.userID == userID);
  //     if (userRating) {
  //       // 3- update the rating
  //       await collection.updateOne(
  //         {
  //           _id: new ObjectId(productID),
  //           "ratings.userID": new ObjectId(userID),
  //         },
  //         {
  //           $set: { "ratings.$.rating": rating }, // projection operator                 c cccv                                         ccc   987

  //         }
  //       );
  //     } else {
  //       await collection.updateOne(
  //         { _id: new ObjectId(productID) },
  //         { $push: { ratings: { userID, rating } } }
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw new ApplicationError("Something went wrong ", 500);
  //   }
  // }

  async averageProductPrice() {
    try {
      const db = getDB();
      return await db
        .collection(this.collection)
        .aggregate([
          // {
          //   stage 1:  Get average price per category
          //   $group: {
          //     _id: "$category",
          //     averagePrice: { $avg: "$price" },
          //  }
          // },
          {
            // stage 2: get the count of rating per product
            $project: {
              countOfRatings: {
                $cond: {
                  if: { $isArray: "$ratings" },
                  then: { $size: "$ratings" },
                  else: 0,
                },
              },
            },
          },
          {
            //stage 3: sort the collections,
            $sort: {
              countOfRating: -1,
            },
          },
          //stage 4: limit to just 1 item in result. (top result)
          {
            $limit: 1,
          },
        ])
        .toArray();
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong ", 500);
    }
  }
}

export default ProductRepository;
