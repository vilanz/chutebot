import path from "path";
import { Sequelize } from "sequelize";

export const sequelizeInstance = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve("./db/db.sqlite"),
  logging: false,
});
