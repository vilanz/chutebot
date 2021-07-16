import { db, User } from "../../../core/db";

const preparedGetAll = db.prepare("SELECT id, wins FROM UserEntities");
const getAll = (): User[] => preparedGetAll.all();

const preparedUpsert = db.prepare<string>(
  "INSERT INTO UserEntities (id, wins) VALUES (?, 0)"
);
const upsertUserWin = (userId: string) => preparedUpsert.run(userId);

export const userRepository = {
  getAll,
  upsertUserWin,
};
