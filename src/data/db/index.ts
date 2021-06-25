// eslint-disable-next-line max-classes-per-file
import { Sequelize, STRING, INTEGER, Model, Association } from "sequelize";

const sequelize = new Sequelize("sqlite::memory:");

export class Players extends Model {
  public readonly id!: number;

  public readonly name!: string;

  public readonly spells?: PlayerSpells[];

  public static associations: {
    spells: Association<Players, PlayerSpells>;
  };
}

Players.init(
  {
    name: STRING,
  },
  {
    sequelize,
  }
);

export class PlayerSpells extends Model {
  public readonly id!: number;

  public readonly club!: string;

  public readonly season!: string;

  public readonly matches!: number;

  public readonly goals!: number;
}

PlayerSpells.init(
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

Players.hasMany(PlayerSpells, {
  foreignKey: "playerId",
  as: "spells",
});
PlayerSpells.belongsTo(Players, {
  foreignKey: "playerId",
});

export const syncDatabase = async () => {
  await Players.sync({ force: true });
  await PlayerSpells.sync({ force: true });
};
