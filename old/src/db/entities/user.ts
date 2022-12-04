import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

export interface User {
  id: string;
  serverId: string;
  wins: number;
}

@Entity({
  name: "users",
})
export class UserEntity extends BaseEntity implements User {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "varchar" })
  serverId!: string;

  @Column({ type: "integer" })
  wins!: number;
}
