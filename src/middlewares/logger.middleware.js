import fs from "fs";
import winston from "winston";

// allow us to use data into files asynchronously without uing callbacks.
const fsPromise = fs.promises;

// async function log(logData) {
//   try {
//     logData = ` \n${new Date().toString()} - ${logData}`;
//     await fsPromise.appendFile("log.txt", logData);
//   } catch (error) {
//     console.log(error);
//   }
// }

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "request-logging" },
  transports: [new winston.transports.File({ filename: "logs.txt" })],
});

const loggerMiddleware = async (req, res, next) => {
  const logData = `${req.url} - ${JSON.stringify(req.body)}`;
  logger.info(logData);
  next();
};

export default loggerMiddleware;
