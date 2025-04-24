import { ApplicationError } from "../../error-handler/applicationError.js";
import { getDB } from "../../config/mongodb.js";

class UserRepository {
  constructor() {
    this.collection = "users";
  }
  async signUp(newUser) {
    try {
      //1- get the database
      const db = getDB();

      // 2- to get the collection
      const collection = db.collection(this.collection);

      // 3- insert the Document.
      await collection.insertOne(newUser);
      return newUser;
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong", 500);
    }
  }

  async signIn(email, password) {
    try {
      //1- get the database
      const db = getDB();

      // 2- to get the collection
      const collection = db.collection(this.collection);

      // 3- find the Document.
      return await collection.findOne({ email, password });
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong", 500);
    }
  }

  async findByEmail(email) {
    try {
      //1- get the database
      const db = getDB();

      // 2- to get the collection
      const collection = db.collection("users");

      // 3- find the Document.
      return await collection.findOne({ email });
    } catch (error) {
      console.log(error);
      throw new ApplicationError("Something went wrong", 500);
    }
  }
}

export default UserRepository;
