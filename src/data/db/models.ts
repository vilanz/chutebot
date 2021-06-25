import { Sequelize, STRING, Model, NUMBER } from "sequelize";

const sequelize = new Sequelize("sqlite::memory:");

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
    sequelize,
  }
);
