import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
// eslint-disable-next-line import/no-cycle
import { PlayerSpell, PlayerSpellEntity } from "./player-spell";

export interface Player {
  transfermarktId: number;
  name: string;
  lastSpellsUpdate: Date;
  spells: PlayerSpell[];
}

@Entity({
  name: "players",
})
export class PlayerEntity extends BaseEntity implements Player {
  @PrimaryColumn({ type: "integer" })
  transfermarktId!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "datetime" })
  lastSpellsUpdate!: Date;

  @OneToMany(() => PlayerSpellEntity, (spell) => spell.player)
  spells!: PlayerSpell[];
}
