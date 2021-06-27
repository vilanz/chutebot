// eslint-disable-next-line max-classes-per-file
import { STRING, Model, Association, INTEGER } from "sequelize";
import { sequelizeInstance } from "../instance";
import { Player } from "../../types";

export interface PlayerAttributes {
  transfermarktId: number;
  name: string;
}

export class PlayerEntity extends Model<PlayerAttributes> {
  public readonly transfermarktId!: number;

  public readonly name!: string;

  public readonly spells?: PlayerSpellEntity[];

  public static associations: {
    spells: Association<PlayerEntity, PlayerSpellEntity>;
  };

  public toInterface = (): Player => ({
    transfermarktId: this.transfermarktId,
    name: this.name,
    spells: this.spells ?? [],
  });
}

PlayerEntity.init(
  {
    transfermarktId: {
      type: STRING,
      primaryKey: true,
    },
    name: STRING,
  },
  {
    sequelize: sequelizeInstance,
    modelName: "player",
  }
);

export interface PlayerSpellAttributes {
  playerTransfermarktId: number;
  club: string;
  season: string;
  matches: number;
  goals: number;
}

export class PlayerSpellEntity extends Model<PlayerSpellAttributes> {
  public readonly id!: number;

  public readonly playerTransfermarktId!: number;

  public readonly club!: string;

  public readonly season!: string;

  public readonly matches!: number;

  public readonly goals!: number;
}

PlayerSpellEntity.init(
  {
    playerTransfermarktId: {
      type: STRING,
      references: {
        model: PlayerEntity,
        key: "transfermarktId",
      },
    },
    club: STRING,
    season: STRING,
    matches: INTEGER,
    goals: INTEGER,
  },
  {
    sequelize: sequelizeInstance,
    modelName: "playerSpells",
  }
);

PlayerEntity.hasMany(PlayerSpellEntity, {
  as: "spells",
});
