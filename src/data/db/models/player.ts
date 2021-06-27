import { STRING, Model, NUMBER } from "sequelize";
import { sequelizeInstance } from "../instance";

export interface PlayerAttributes {
  transfermarktId: number;
  name: string;
}

export class PlayerEntity extends Model<PlayerAttributes> {
  public readonly transfermarktId!: number;

  public readonly name!: string;
}

PlayerEntity.init(
  {
    transfermarktId: {
      type: NUMBER,
      primaryKey: true,
    },
    name: STRING,
  },
  {
    sequelize: sequelizeInstance,
  }
);
