import { RunResult } from "better-sqlite3";
import { db, User } from "../../../core/db";

export class UserRepository {
  private SMT_GET_ALL = db.prepare("SELECT id, wins FROM users");

  private SMT_UPSERT_USERWIN = db.prepare<string>(
    `INSERT INTO users (id, wins) VALUES (?, 1)
    ON CONFLICT(id) DO UPDATE SET wins = wins + 1;`
  );

  getAll(): User[] {
    return this.SMT_GET_ALL.all();
  }

  upsertUserWin(userId: string): RunResult {
    return this.SMT_UPSERT_USERWIN.run(userId);
  }
}