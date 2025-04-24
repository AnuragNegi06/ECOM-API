import jwt from "jsonwebtoken";

const jwtAuth = (req, res, next) => {
  // 1- Read the token.
  const token = req.headers["authorization"];
  console.log(token);

  // 2- if no token, return the error.
  if (!token) {
    return res.status(401).send("unauthorized");
  }

  // 3- chech if token is valid.
  try {
    const payload = jwt.verify(token, "ZmGp9P8xHDkhytV4wuCf3P8gpdoYNKK7");
    console.log(payload);
    req.userID = payload.userID;
    // 5- call next middleware.
    next();
  } catch (err) {
    // 4- return error.
    return res.status(401).send("unauthorized");
  }
};

export default jwtAuth;
