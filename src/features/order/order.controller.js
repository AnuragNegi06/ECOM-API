import OrderRepository from "./order.repository.js";

export default class OrderController {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async placeOrder(req, res, next) {
    try {
      const userID = req.userID;
      await this.orderRepository.placeOrder(userID);
      res.status(200).send("Order is placed");
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  }
}
