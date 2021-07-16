// eslint-disable-next-line max-classes-per-file
import { STRING, Model, Association, INTEGER, DATE } from "sequelize";
import { Player } from "../../../trivia/types";
import { sequelizeInstance } from "../sequelize";

export interface PlayerAttributes {
  transfermarktId: number;
  name: string;
  lastSpellsUpdate: Date;
}

export class PlayerEntity extends Model<PlayerAttributes> {
  public readonly transfermarktId!: number;

  public readonly name!: string;

  public readonly lastSpellsUpdate!: Date;

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
      type: INTEGER,
      primaryKey: true,
    },
    name: STRING,
    lastSpellsUpdate: DATE,
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
      type: INTEGER,
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
    modelName: "player_spells",
  }
);

PlayerEntity.hasMany(PlayerSpellEntity, {
  as: "spells",
});
