import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
// eslint-disable-next-line import/no-cycle
import { Player, PlayerEntity } from "./player";

export interface PlayerSpell {
  id: number;
  serverId: string;
  club: string;
  season: string;
  matches: number;
  goals: number;
  player: Player;
}

@Entity({
  name: "player_spells",
})
export class PlayerSpellEntity extends BaseEntity implements PlayerSpell {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  serverId!: string;

  @Column({ type: "varchar" })
  season!: string;

  @Column({ type: "varchar" })
  club!: string;

  @Column({ type: "integer" })
  goals!: number;

  @Column({ type: "integer" })
  matches!: number;

  @ManyToOne(() => PlayerEntity, (player) => player.spells)
  @JoinColumn({
    name: "playerTransfermarktId",
  })
  player!: Player;
}
