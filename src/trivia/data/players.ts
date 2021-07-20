import { RunResult } from "better-sqlite3";
import format from "date-fns/format";
import subWeeks from "date-fns/subWeeks";
import { db, getPlayerByTransfermarktId, Player } from "../../core/db";
import { logger } from "../../core/log";
import { TriviaPlayer } from "../types";

export class PlayerRepository {
  private SMT_COUNT = db.prepare("SELECT COUNT(*) as count FROM players");

  count(): number {
    return this.SMT_COUNT.get().count;
  }

  private SMT_SEARCH = db.prepare<string>(
    `SELECT transfermarktId, name, lastSpellsUpdate
    FROM players WHERE name LIKE ?`
  );

  searchPlayers(name: string): Player[] {
    return this.SMT_SEARCH.all(`%${name}%`);
  }

  private SMT_GET_PLAYER = db.prepare<number>(
    `SELECT transfermarktId, name, lastSpellsUpdate
    FROM players WHERE transfermarktId = ?`
  );

  getById(id: number): Player {
    return this.SMT_GET_PLAYER.get(id);
  }

  private SMT_RANDOM_ID = db.prepare(
    "SELECT transfermarktId FROM players ORDER BY RANDOM() LIMIT 1"
  );

  // TODO return Player
  async getRandom(): Promise<TriviaPlayer> {
    const randomPlayerId = this.SMT_RANDOM_ID.get().transfermarktId;
    // TODO use better-sqlite3
    const randomPlayer = await getPlayerByTransfermarktId(randomPlayerId);
    return randomPlayer!.toInterface();
  }

  private SMT_DELETE_PLAYER = db.prepare<number>(
    "DELETE FROM players WHERE transfermarktId = ?"
  );

  delete(id: number): RunResult {
    return this.SMT_DELETE_PLAYER.run(id);
  }

  private SMT_DELETE_OUTDATED_SPELLS = db.prepare<string>(
    `DELETE FROM player_spells WHERE playerTransfermarktId IN
      (SELECT transfermarktId FROM players WHERE lastSpellsUpdate <= ?)`
  );

  private SMT_REFRESH_OUTDATED_PLAYER = db.prepare<string>(
    `UPDATE players SET lastSpellsUpdate = datetime() WHERE lastSpellsUpdate <= ?`
  );

  removeOutdatedPlayers(): void {
    const lastWeek = subWeeks(new Date(), 2);
    const lastWeekString = format(lastWeek, "yyyy-MM-dd hh:mm:ss");
    logger.info(
      "removing players with last spell update before %s",
      lastWeekString
    );
    const removeSpells = db.transaction((d: string) => {
      this.SMT_DELETE_OUTDATED_SPELLS.run(d);
      this.SMT_REFRESH_OUTDATED_PLAYER.run(d);
    });
    removeSpells(lastWeekString);
  }
}
