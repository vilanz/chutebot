import { STRING, Model, NUMBER } from "sequelize";
import { sequelizeInstance } from "../instance";

export class PlayerEntity extends Model {
  public readonly id!: number;

  public readonly name!: string;

  public readonly transfermarktId!: number;
}

PlayerEntity.init(
  {
    name: STRING,
    transfermarktId: NUMBER,
  },
  {
    sequelize: sequelizeInstance,
  }
);
