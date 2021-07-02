import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss Z",
    }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: "log",
      dirname: "logs",
      zippedArchive: true,
      maxsize: 400000, // 400 KB
    }),
  ],
});
