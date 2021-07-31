import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "users",
})
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  wins!: number;
}
