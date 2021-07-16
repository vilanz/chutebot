import { db, Player } from "../../../core/db";

export class PlayerRepository {
  private SMT_COUNT = db.prepare("SELECT COUNT(*) as count FROM players");

  private SMT_SEARCH = db.prepare<string>(`
    SELECT transfermarktId, name, lastSpellsUpdate FROM players
    WHERE name LIKE ?
  `);

  count(): number {
    return this.SMT_COUNT.get().count;
  }

  searchPlayers(name: string): Player[] {
    return this.SMT_SEARCH.all(`%${name}%`);
  }
}
