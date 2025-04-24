import ProductModel from "./product.model.js";
import ProductRepository from "./product.repository.js";

export default class productController {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(req, res) {
    try {
      const products = await this.productRepository.getAll();
      res.status(200).send(products);
    } catch (error) {
      return res.status(400).send("Incorrect Credentials");
    }
  }

  async addProduct(req, res) {
    try {
      const { name, price, sizes, categories, description } = req.body;
      const newProduct = new ProductModel(
        name,
        description,
        parseFloat(price),
        req?.file?.filename, // null check using ?
        categories,
        sizes?.split(",") // null check using ?
      );
      const createdRecord = await this.productRepository.add(newProduct);
      res.status(201).send(createdRecord);
    } catch (error) {
      console.log(error);
      return res.status(400).send("Incorrect Credentials");
    }
  }

  async filterProduct(req, res) {
    try {
      const { minPrice, categories } = req.query; // maxPrice,
      const result = await this.productRepository.filter(minPrice, categories); // maxPrice,
      console.log(result);
      res.status(200).send(result);
    } catch (error) {
      return res.status(400).send("Incorrect Credentials");
    }
  }

  async getOneProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await this.productRepository.get(id);
      if (!product) {
        res.status(404).send({ message: "Product not found" });
      } else {
        res.status(200).send(product);
      }
    } catch (error) {
      return res.status(400).send("Incorrect Credentials");
    }
  }

  async ratingProduct(req, res, next) {
    //object destructuring
    try {
      const { productID, rating } = req.body;
      const userID = req.userID;
      await this.productRepository.rate(userID, productID, rating);
      res.status(200).send("rating has been added");
    } catch (error) {
      console.log("passing error to middleware");
      next(error);
    }
  }

  async averagePrice(req, res, next) {
    try {
      const result = await this.productRepository.averageProductPrice();
      res.status(200).send(result);
    } catch (error) {
      return res.status(400).send("Incorrect Credentials");
    }
  }
}
