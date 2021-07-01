import { Snowflake } from "discord.js";
import { differenceInCalendarDays } from "date-fns";
import { logger } from "../../core/log";
import { Player, PlayerSpell } from "../types";
import { sequelizeInstance } from "./sequelize";
import { PlayerEntity, UserEntity, PlayerSpellEntity } from "./models";

export const getRandomPlayerId = () =>
  PlayerEntity.findOne({
    attributes: ["transfermarktId"],
    order: sequelizeInstance.random(),
  }).then((p) => p?.transfermarktId);

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

export const removeOldPlayerSpells = async (
  transfermarktId: number
): Promise<void> => {
  const lastSpellsUpdate = await PlayerEntity.findOne({
    attributes: ["lastSpellsUpdate"],
    where: {
      transfermarktId,
    },
  }).then((p) => p?.lastSpellsUpdate);
  if (!lastSpellsUpdate) {
    logger.warn(
      "removeOldSpells: player not found, something is wrong %s",
      transfermarktId
    );
    return;
  }

  const now = new Date();
  const daysSinceLastUpdate = differenceInCalendarDays(now, lastSpellsUpdate);
  logger.info("daysSinceLastUpdate: %s", daysSinceLastUpdate);
  if (daysSinceLastUpdate < 7) {
    return;
  }

  await PlayerSpellEntity.destroy({
    where: {
      playerTransfermarktId: transfermarktId,
    },
  });
};

export const addPlayerSpells = async (
  transfermarktId: number,
  spells: PlayerSpell[]
) => {
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
};

export const createPlayer = async (player: Player) => {
  const { transfermarktId, name, spells } = player;
  const entity = await PlayerEntity.create({
    transfermarktId,
    name,
    lastSpellsUpdate: new Date(),
  });
  await addPlayerSpells(transfermarktId, spells);
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