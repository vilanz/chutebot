import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.timestamp(),
    format.prettyPrint()
  ),
  transports: [new transports.File({ filename: "guess-the-player.log" })],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console());
}
