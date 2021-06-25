// eslint-disable-next-line max-classes-per-file
import { Sequelize } from "sequelize";
import { PlayerEntity, PlayerSpellEntity } from "./models";

export const sequelizeInstance = new Sequelize("sqlite::memory:");

export const syncDatabase = async () => {
  await PlayerEntity.sync();
  await PlayerSpellEntity.sync();
};
