import { createConnection } from "typeorm";
import { Player, PlayerSpell, User } from "./entities";

export const createTypeORMConnection = () =>
  createConnection({
    type: "sqlite",
    database: "db/db.sqlite",
    enableWAL: true,
    synchronize: false,
    logging: true,
    entities: [PlayerSpell, Player, User],
  });
