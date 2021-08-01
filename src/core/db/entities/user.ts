import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

export interface User {
  id: string;
  wins: number;
}

@Entity({
  name: "users",
})
export class UserEntity extends BaseEntity implements User {
  @PrimaryColumn({ type: "varchar", length: "255" })
  id!: string;

  @Column({ type: "integer" })
  wins!: number;
}
