import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
// eslint-disable-next-line import/no-cycle
import { PlayerSpell, PlayerSpellEntity } from "./player-spell";

export interface Player {
  transfermarktId: number;
  serverId: string;
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

  @Column({ type: "varchar" })
  serverId!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "datetime" })
  lastSpellsUpdate!: Date;

  @OneToMany(() => PlayerSpellEntity, (spell) => spell.player)
  spells!: PlayerSpell[];
}
