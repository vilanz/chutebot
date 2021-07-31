import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "users",
})
export class User extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  wins!: number;
}
