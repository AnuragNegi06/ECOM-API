import CartItemModel from "./cart.model.js";
import CartRepository from "./cart.repository.js";

export default class CartItemsController {
  constructor() {
    this.cartRepository = new CartRepository();
  }
  async add(req, res) {
    try {
      const { productID, quantity } = req.body;
      const userID = req.userID;
      console.log(userID);
      await this.cartRepository.add(productID, userID, quantity);
      res.status(201).send("Cart is updated");
    } catch (error) {
      return res.status(400).send("Something went wrong");
    }
  }

  async get(req, res) {
    try {
      const userID = req.userID;
      console.log(userID);
      const items = await this.cartRepository.get(userID);
      return res.status(200).send(items);
    } catch (error) {
      return res.status(400).send("Something went wrong");
    }
  }

  async deleteItem(req, res) {
    const userID = req.userID;
    const cartItemID = req.params.id;
    const isDeleted = await this.cartRepository.delete(cartItemID, userID);
    if (!isDeleted) {
      return res.status(404).send("Item not found");
    }
    res.status(200).send("cart item is removed");
  }
}
