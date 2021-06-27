export interface PlayerCareer {
  playerName: string;
  spells: PlayerSpell[];
}

export interface PlayerSpell {
  club: string;
  season: string;
  matches: number;
  goals: number;
}
