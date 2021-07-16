import { db } from "../../../core/db";

export class PlayerRepository {
  private SMT_COUNT = db.prepare("SELECT COUNT(*) as count FROM players");

  count(): number {
    return this.SMT_COUNT.get().count;
  }
}
