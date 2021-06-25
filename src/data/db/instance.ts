import { Sequelize } from "sequelize";
import { PlayerEntity } from "./models";

export const sequelizeInstance = new Sequelize("sqlite::memory:");

export const syncDatabase = async () => {
  await PlayerEntity.sync();
};
