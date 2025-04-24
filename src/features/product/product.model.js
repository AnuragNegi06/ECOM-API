import UserModel from "../user/user.model.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class ProductModel {
  constructor(name, desc, price, imageUrl, category, sizes, id) {
    this.name = name;
    this.desc = desc;
    this.price = price;
    this.imageUrl = imageUrl;
    this.category = category;
    this.sizes = sizes;
    this._id = id;
  }

  static add(product) {
    product.id = products.length + 1;
    products.push(product);
    return product;
  }

  static get(id) {
    const product = products.find((i) => i.id == id);
    return product;
  }

  static getAll() {
    return products;
  }

  static filterPro(minPrice, maxPrice, category) {
    const result = products.filter((product) => {
      return (
        (!minPrice || product.price >= minPrice) &&
        (!maxPrice || product.price <= maxPrice) &&
        (!category || product.category === category)
      );
    });
    return result;
  }

  static rateProduct(userId, productId, rating) {
    //1- validate user and product
    const user = UserModel.getAll().find((u) => u.id == userId);
    if (!user) {
      throw new ApplicationError("User not found", 404); // instance of Error class with message.
    }
    // validate product
    const product = products.find((p) => p.id == productId);
    if (!product) {
      throw new ApplicationError("product not found", 400);
    }
    // 2- check if there are any ratings and if not then add ratings array
    if (!product.ratings) {
      product.ratings = [];
      product.ratings.push({
        userId: userId,
        ratings: rating,
      });
    } else {
      // 3- check if user rating already available.
      const existingRatingIndex = product.ratings.find(
        (r) => r.userId == userId
      );
      if (existingRatingIndex >= 0) {
        product.ratings[existingRatingIndex] = {
          userId: userId,
          rating: rating,
        };
      } else {
        // 4- if no existing rating, then add new rating.
        product.ratings.push({
          userId: userId,
          ratings: rating,
        });
      }
    }
  }
}

var products = [
  new ProductModel(
    1,
    "Product 1",
    "Description for Product 1",
    19.99,
    "https://m.media-amazon.com/images/I/51-nXsSRfZL._SX328_BO1,204,203,200_.jpg",
    "Category1",
    ["S", "M", "L", "XL"]
  ),
  new ProductModel(
    2,
    "Product 2",
    "Description for Product 2",
    29.99,
    "https://m.media-amazon.com/images/I/51xwGSNX-EL._SX356_BO1,204,203,200_.jpg",
    "Category2",
    ["S", "M", "L", "XL", "XXL"]
  ),
  new ProductModel(
    3,
    "Product 3",
    "Description for Product 3",
    39.99,
    "https://m.media-amazon.com/images/I/31PBdo581fL._SX317_BO1,204,203,200_.jpg",
    "Category3",
    ["S", "M", "L", "XL", "XXL"]
  ),
];
