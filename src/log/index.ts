import winston from "winston";

export const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "guess-the-player.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}
