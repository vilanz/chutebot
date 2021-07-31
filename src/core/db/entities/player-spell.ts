import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
// eslint-disable-next-line import/no-cycle
import { Player } from "./player";

@Entity({
  name: "player_spells",
})
export class PlayerSpell extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  club!: string;

  @Column()
  season!: string;

  @Column()
  matches!: number;

  @ManyToOne(() => Player, (player) => player.spells)
  @JoinColumn({
    name: "playerTransfermarktId",
  })
  player!: Player;
}
