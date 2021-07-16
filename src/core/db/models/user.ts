import { STRING, Model, NUMBER } from "sequelize";
import { sequelizeInstance } from "../sequelize";

export interface UserAttributes {
  id: string;
  wins: number;
}

export class UserEntity extends Model<UserAttributes> {
  public readonly id!: string;

  public readonly wins!: number;
}

UserEntity.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
    wins: {
      type: NUMBER,
      defaultValue: 0,
    },
  },
  {
    sequelize: sequelizeInstance,
  }
);
