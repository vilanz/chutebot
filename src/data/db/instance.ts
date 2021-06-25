// eslint-disable-next-line max-classes-per-file
import { Sequelize } from "sequelize";

export const sequelizeInstance = new Sequelize("sqlite::memory:");
