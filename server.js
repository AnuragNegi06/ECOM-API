//1. Import express
import dotenv from "dotenv";
//load all the environment variables in applications.
dotenv.config();

import express, { response } from "express";
import swagger from "swagger-ui-express";
import cors from "cors";
import mongoose from "mongoose";

import productRouter from "./src/features/product/product.routes.js";
import userRouter from "./src/features/user/user.routes.js";
import bodyParser from "body-parser";
import jwtAuth from "./src/middlewares/jwt.middleware.js";
import cartRouter from "./src/features/cart/cart.routes.js";
import orderRouter from "./src/features/order/order.routes.js";
import likeRouter from "./src/features/like/like.routes.js";
import apiDocs from "./swagger.json" assert { type: "json" };
import loggerMiddleware from "./src/middlewares/logger.middleware.js";
import { ApplicationError } from "./src/error-handler/applicationError.js";
// import { connectToMongoDB } from "./src/config/mongodb.js";
import { connectUsingMongoose } from "./src/config/mongooseConfig.js";

// 2. create server
const server = express();

// CORS policy configuration
// '*' - give access to all the clients

// using library of cors.
var corsOptions = {
  origin: "http://localhost:5500",
  allowedHeaders: "*",
};

server.use(cors(corsOptions));

// server.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5500");
//   res.header("Access-Control-Allow-Headers", "*");
//   res.header("Access-Control-Allow-Methods", "*");
//   // return OK for preflight request.
//   if (req.method == "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

server.use(bodyParser.json());

// for all requests related to product, redirect to product routes.
// localhost:3200/api/products.

// logger middleware
server.use(loggerMiddleware);

server.use("/api/products", jwtAuth, productRouter);
server.use("/api/users", userRouter);
server.use("/api/cartItems", jwtAuth, cartRouter);
server.use("/api/orders", jwtAuth, orderRouter);
server.use("/api/likes", jwtAuth, likeRouter);

// creating path for swagger
server.use("/api/docs", swagger.serve, swagger.setup(apiDocs));

// 3.  Default request handler
server.get("/", (req, res) => {
  res.send("Welcome to E-commerce APIs");
});

//Error handler middleware
server.use((err, req, res, next) => {
  console.log(err);

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).send(err.message);
  }

  if (err instanceof ApplicationError) {
    return res.status(err.code).send(err.message);
  }

  // server errors.
  res.status(500).send("Something went wrong, please try later");
  next();
});

// 4. Middleware to handle 404 requests.
server.use((req, res) => {
  // doesn't has path so it will automatically execute whenever error occurs with other middlewares.
  res
    .status(404)
    .send(
      "API not found. Please check our documenation for more information localhost:3200/api/docs. "
    );
});

// 5. specify port
server.listen(3200, () => {
  console.log("Server is running on port 3200");
  // connectToMongoDB();
  connectUsingMongoose();
});
