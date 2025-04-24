import express from "express";
import CartItemController from "./cart.controller.js";

const cartRouter = express.Router();
const cartItemController = new CartItemController();

cartRouter.post("/", (req, res) => {
  cartItemController.add(req, res);
});
cartRouter.get("/", (req, res) => {
  cartItemController.get(req, res);
});
cartRouter.delete("/:id", (req, res) => {
  cartItemController.deleteItem(req, res);
});

export default cartRouter;
