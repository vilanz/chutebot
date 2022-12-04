import { createConnection } from "typeorm";
import { PlayerEntity, PlayerSpellEntity, UserEntity } from "./entities";

export const createTypeORMConnection = async () => {
  const conn = await createConnection({
    type: "better-sqlite3",
    database: "db/db.sqlite",
    synchronize: false,
    maxQueryExecutionTime: 1000,
    logging: ["schema", "error", "warn"],
    entities: [PlayerSpellEntity, PlayerEntity, UserEntity],
  });
  await conn.query("PRAGMA journal_mode = WAL");
};
