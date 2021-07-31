import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "players",
})
export class Player {
  @PrimaryColumn()
  transfermarktId!: number;

  @Column()
  name!: string;

  @Column()
  lastSpellsUpdate!: Date;
}
