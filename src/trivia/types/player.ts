import { PlayerEntity } from "../../core/db";

export interface TriviaPlayer {
  transfermarktId: number;
  name: string;
  spells: PlayerSpell[];
}

export const triviaPlayerFromEntity = (playerEntity: PlayerEntity): TriviaPlayer => ({
  transfermarktId: playerEntity.transfermarktId,
  name: playerEntity.name,
  spells: playerEntity.spells ?? [],
});

export interface PlayerSpell {
  club: string;
  season: string;
  matches: number;
  goals: number;
}

