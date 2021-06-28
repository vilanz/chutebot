import { Snowflake } from "discord.js";
import { logger } from "../../log";
import { Player } from "../types";
import { sequelizeInstance } from "./instance";
import { PlayerEntity, UserEntity, PlayerSpellEntity } from "./models";

export const getRandomPlayer = () =>
  PlayerEntity.findOne({
    order: sequelizeInstance.random(),
    include: [PlayerEntity.associations.spells],
  });

export const getPlayerByTransfermarktId = (transfermarktId: number) =>
  PlayerEntity.findOne({
    where: {
      transfermarktId,
    },
    include: [PlayerEntity.associations.spells],
  });

export const playerExists = async (
  transfermarktId: number
): Promise<boolean> => {
  const count = await PlayerEntity.count({
    where: {
      transfermarktId,
    },
  });
  return count > 0;
};

export const hasPlayers = async (): Promise<boolean> => {
  const count = await PlayerEntity.count();
  return count > 0;
};

export const createPlayer = async (player: Player) => {
  const { transfermarktId, name, spells } = player;
  const entity = await PlayerEntity.create({
    transfermarktId,
    name,
    lastSpellsUpdate: new Date(),
  });
  if (spells?.length) {
    PlayerSpellEntity.bulkCreate(
      spells.map((spell) => {
        const { season, club, goals, matches } = spell;
        return {
          playerTransfermarktId: transfermarktId,
          season,
          club,
          goals,
          matches,
        };
      })
    );
  }
  logger.info("created player %s", entity);
  return entity;
};

export const addUserWin = async (userId: Snowflake) => {
  const idAsString = userId.toString();
  const [user] = await UserEntity.findOrCreate({
    where: {
      id: idAsString,
    },
    defaults: {
      id: idAsString,
      wins: 0,
    },
  });
  await user.increment("wins");
};

// TODO limit users quantity
export const getUserWins = () =>
  UserEntity.findAll({
    order: [["wins", "DESC"]],
  });
