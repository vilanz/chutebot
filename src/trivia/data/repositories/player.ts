import { RunResult } from "better-sqlite3";
import { db, Player } from "../../../core/db";

export class PlayerRepository {
  private SMT_COUNT = db.prepare("SELECT COUNT(*) as count FROM players");

  private SMT_SEARCH = db.prepare<string>(
    `SELECT transfermarktId, name, lastSpellsUpdate
    FROM players WHERE name LIKE ?`
  );

  private SMT_GET_PLAYER = db.prepare<number>(
    `SELECT transfermarktId, name, lastSpellsUpdate
    FROM players WHERE transfermarktId = ?`
  );

  private SMT_DELETE_PLAYER = db.prepare<number>(
    "DELETE FROM players WHERE transfermarktId = ?"
  );

  count(): number {
    return this.SMT_COUNT.get().count;
  }

  searchPlayers(name: string): Player[] {
    return this.SMT_SEARCH.all(`%${name}%`);
  }

  getById(id: number): Player {
    return this.SMT_GET_PLAYER.get(id);
  }

  delete(id: number): RunResult {
    return this.SMT_DELETE_PLAYER.run(id);
  }
}
