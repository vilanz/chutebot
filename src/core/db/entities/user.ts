import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "users",
})
export class User extends BaseEntity {
  @PrimaryColumn({ type: "varchar", length: "255" })
  id!: string;

  @Column({ type: "integer" })
  wins!: number;
}
