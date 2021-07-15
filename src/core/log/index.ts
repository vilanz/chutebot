import { createLogger, format, transports } from "winston";

const defaultFormats = format.combine(
  format.errors({ stack: true }),
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss Z",
  }),
  format.splat(),
  format.json(),
  format.prettyPrint()
)

export const logger = createLogger({
  transports: [
    new transports.File({
      filename: "log",
      dirname: "logs",
      zippedArchive: true,
      format: defaultFormats,
    }),
    new transports.Console({
      format: format.combine(
        defaultFormats,
        format.colorize()
      )
    }),
  ],
});
