// eslint-disable-next-line max-classes-per-file
import {
  Sequelize,
  STRING,
  INTEGER,
  Model,
  Association,
  HasManyCreateAssociationMixin,
  NUMBER,
} from "sequelize";
import { Player } from "../types";

const sequelize = new Sequelize("sqlite::memory:");

export class PlayerEntity extends Model {
  public readonly id!: number;

  public readonly transfermarktId!: number;

  public readonly name!: string;

  public createSpell!: HasManyCreateAssociationMixin<PlayerSpellEntity>;

  public readonly spells?: PlayerSpellEntity[];

  public static associations: {
    spells: Association<PlayerEntity, PlayerSpellEntity>;
  };

  public toInterface = (): Player => ({
    name: this.name,
    transfermarktId: this.transfermarktId,
    spells: this.spells ?? [],
  });
}

PlayerEntity.init(
  {
    transfermarktId: NUMBER,
    name: STRING,
  },
  {
    sequelize,
  }
);

export class PlayerSpellEntity extends Model {
  public readonly id!: number;

  public readonly club!: string;

  public readonly season!: string;

  public readonly matches!: number;

  public readonly goals!: number;
}

PlayerSpellEntity.init(
  {
    club: STRING,
    season: STRING,
    matches: INTEGER,
    goals: INTEGER,
  },
  {
    sequelize,
  }
);

PlayerEntity.hasMany(PlayerSpellEntity, {
  sourceKey: "id",
  foreignKey: "playerId",
  as: "spells",
});
