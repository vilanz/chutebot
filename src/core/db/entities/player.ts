import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
// eslint-disable-next-line import/no-cycle
import { PlayerSpell } from "./player-spell";

@Entity({
  name: "players",
})
export class Player extends BaseEntity {
  @PrimaryColumn()
  transfermarktId!: number;

  @Column()
  name!: string;

  @Column()
  lastSpellsUpdate!: Date;

  @OneToMany(() => PlayerSpell, (spell) => spell.player)
  spells!: PlayerSpell[];
}
