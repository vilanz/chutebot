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
}

export const playerService = new PlayerService();
