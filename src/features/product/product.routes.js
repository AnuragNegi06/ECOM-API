// Manage routes/paths to ProductsController

// 1. Import express.
import express from "express";
import ProductController from "./product.controller.js";
import { upload } from "../../middlewares/fileupload.middleware.js";

//2. Initialize express router.
const productRouter = express.Router();
const productController = new ProductController();

// All the paths to controller methods.
// localhost:3200/api/products
productRouter.get("/", (req, res) => {
  productController.getAllProducts(req, res);
});

productRouter.post("/", upload.single("imageUrl"), (req, res) => {
  productController.addProduct(req, res);
});

//http://localhost:3200/api/products/filter?minPrice=10&maxPrice=30&category=category1
productRouter.get("/filter", (req, res) => {
  productController.filterProduct(req, res);
});
productRouter.get("/averagePrice", (req, res) => {
  productController.averagePrice(req, res);
});
productRouter.get("/:id", (req, res) => {
  productController.getOneProduct(req, res);
});
productRouter.post("/rate", (req, res, next) => {
  productController.ratingProduct(req, res, next);
});

export default productRouter;
