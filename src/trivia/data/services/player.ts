import { RunResult } from "better-sqlite3";
import { Player } from "../../../core/db";
import { PlayerRepository } from "../repositories";

class PlayerService {
  private playerRepository = new PlayerRepository();

  count(): number {
    return this.playerRepository.count();
  }

  searchPlayers(name: string): Player[] {
    return this.playerRepository.searchPlayers(name);
  }

  getById(id: number): Player {
    return this.playerRepository.getById(id);
  }

  delete(id: number): RunResult {
    return this.playerRepository.delete(id);
  }
}

export const playerService = new PlayerService();
