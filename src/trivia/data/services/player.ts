import { RunResult } from "better-sqlite3";
import { getPlayerByTransfermarktId, Player } from "../../../core/db";
import { TriviaPlayer } from "../../types";
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

  async getRandom(): Promise<TriviaPlayer> {
    const randomPlayerId = this.playerRepository.getRandomId();
    // TODO use better-sqlite3
    const randomPlayer = await getPlayerByTransfermarktId(randomPlayerId);
    return randomPlayer!.toInterface();
  }

  delete(id: number): RunResult {
    return this.playerRepository.delete(id);
  }
}

export const playerService = new PlayerService();
