// eslint-disable-next-line max-classes-per-file
import {
  Sequelize,
  STRING,
  INTEGER,
  Model,
  Association,
  HasManyCreateAssociationMixin,
  literal,
} from "sequelize";
import { Player } from "../types";

const sequelize = new Sequelize("sqlite::memory:");

export class PlayerEntity extends Model {
  public readonly id!: number;

  public readonly name!: string;

  public createSpell!: HasManyCreateAssociationMixin<PlayerSpellEntity>;

  public readonly spells?: PlayerSpellEntity[];

  public static associations: {
    spells: Association<PlayerEntity, PlayerSpellEntity>;
  };

  public toInterface = (): Player => ({
    name: this.name,
    spells: this.spells ?? [],
  });
}

PlayerEntity.init(
  {
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

export const syncDatabase = async () => {
  await PlayerEntity.sync({ force: true });
  await PlayerSpellEntity.sync({ force: true });
};

export const getRandomPlayer = () =>
  PlayerEntity.findOne({
    order: literal("random"),
  });