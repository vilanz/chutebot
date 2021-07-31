import { createConnection } from "typeorm";
import { Player, User } from "./entities";

export const getTypeORMConnection = () =>
  createConnection({
    type: "sqlite",
    database: "db/db.sqlite",
    enableWAL: true,
    synchronize: false,
    logging: true,
    entities: [Player, User],
  });
