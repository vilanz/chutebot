export interface Player {
  name: string;
  spells: PlayerSpell[];
}

export interface PlayerSpell {
  season: string;
  date: Date;
  from?: PlayerSpellClub;
  to?: PlayerSpellClub;
  transferFee: string;
}

export interface PlayerSpellClub {
  country: string;
  name: string;
}
