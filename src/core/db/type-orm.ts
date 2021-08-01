import { createConnection } from "typeorm";
import { PlayerEntity, PlayerSpellEntity, User } from "./entities";

export const createTypeORMConnection = () =>
  createConnection({
    type: "better-sqlite3",
    database: "db/db.sqlite",
    synchronize: false,
    logging: true,
    entities: [PlayerSpellEntity, PlayerEntity, User],
  });
