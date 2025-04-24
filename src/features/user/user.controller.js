import UserModel from "./user.model.js";
import jwt from "jsonwebtoken";
import UserRepository from "./user.repository.js";
import bcrypt from "bcrypt";

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }
  async signUp(req, res, next) {
    const { name, email, password, type } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new UserModel(name, email, hashedPassword, type);
      await this.userRepository.signUp(user);
      res.status(201).send(user);
    } catch (err) {
      next(err);
      console.log(err);
      // res.status(400).send("User already exists");
    }
  }

  async signIn(req, res, next) {
    try {
      // 1- find user by email.
      const user = await this.userRepository.findByEmail(req.body.email);
      if (!user) {
        return res.status(400).send("Incorrect Credentials");
      } else {
        //2 - compare password with hashed password
        const result = bcrypt.compare(req.body.email, user.password);
        if (result) {
          // 3- create token
          const token = jwt.sign(
            { userID: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          // 4- send token
          res.status(200).send(token);
        } else {
          return res.status(400).send("Incorrect Credentials");
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
      // res.status(500).send("Something went wrong");
    }
  }

  getUser(req, res) {
    const user = UserModel.getAll();
    res.status(200).send(user);
  }

  async resetPassword(req, res, next) {
    const { newPassword } = req.body;
    const userID = req.userID;
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    try {
      await this.userRepository.resetPassword(userID, hashedNewPassword);
      res.status(200).send("Passworrd is reset successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong");
    }
  }
}
