export interface Player {
  transfermarktId: number;
  name: string;
  spells: PlayerSpell[];
}

export interface PlayerSpell {
  club: string;
  season: string;
  matches: number;
  goals: number;
}
