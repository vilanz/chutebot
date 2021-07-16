import { PlayerRepository } from "../repositories";

class PlayerService {
  private playerRepository = new PlayerRepository();

  count(): number {
    return this.playerRepository.count();
  }
}

export const playerService = new PlayerService();
