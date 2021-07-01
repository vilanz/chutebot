import path from "path";
import { Sequelize } from "sequelize";
import { logger } from "../../core/log";

export const sequelizeInstance = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve("./db.sqlite"),
  logging: (msg) => logger.info(msg),
});