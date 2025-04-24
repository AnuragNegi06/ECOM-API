import { likeRepository } from "./like.repository.js";

export default class LikeController {
  constructor() {
    this.likeRepository = new likeRepository();
  }

  async likeItem(req, res, next) {
    try {
      const { ID, type } = req.body;
      const userID = req.userID;
      if (type != "Product" && type != "Category") {
        return res.status(400).send("Invalid Type");
      }
      if (type == "Product") {
        this.likeRepository.likeProduct(userID, ID);
      } else {
        this.likeRepository.likeCategory(userID, ID);
      }
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(400).send("Something went worng");
    }
  }

  async getLikes(req, res) {
    const { ID, type } = req.body;
    try {
      const likes = await this.likeRepository.getLikes(type, ID);
      res.status(200).send(likes);
    } catch (error) {
      console.log(error);
      res.status(400).send("Something went worng");
    }
  }
}
