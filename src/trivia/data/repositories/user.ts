import { db, User } from "../../../core/db";

const preparedGetAll = db.prepare("SELECT id, wins FROM users");
const getAll = (): User[] => preparedGetAll.all();

const preparedUpsertUserWin = db.prepare<string>(
  `INSERT INTO users (id, wins) VALUES (?, 1)
  ON CONFLICT(id) DO UPDATE SET wins = wins + 1;`
);
const upsertUserWin = (userId: string) => preparedUpsertUserWin.run(userId);

export const userRepository = {
  getAll,
  upsertUserWin,
};
