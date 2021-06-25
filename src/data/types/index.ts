export interface Player {
  name: string;
  transfermarktId: number;
  spells: PlayerSpell[];
}

export interface PlayerSpell {
  club: string;
  season: string;
  matches: number;
  goals: number;
}
