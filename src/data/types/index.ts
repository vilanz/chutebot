export interface Player {
  name: string;
  spells: PlayerSpell[];
}

export interface PlayerSpell {
  club: string;
  season: string;
  matches: number;
  goals: number;
}
