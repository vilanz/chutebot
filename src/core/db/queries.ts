import { differenceInCalendarDays } from "date-fns";
import { logger } from "../log";
import { PlayerSpell, TriviaPlayer } from "../../trivia/types";
import { sequelizeInstance } from "./sequelize";
import { PlayerEntity, PlayerSpellEntity } from "./models";

// TODO move all this cruft to the new better-sqlite3 architecture

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

export const getPlayerCount = (): Promise<number> => PlayerEntity.count();

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
): Promise<boolean> => {
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
    return false;
  }

  const now = new Date();
  const daysSinceLastUpdate = differenceInCalendarDays(now, lastSpellsUpdate);
  logger.info("daysSinceLastUpdate: %s", daysSinceLastUpdate);
  if (daysSinceLastUpdate < 7) {
    return false;
  }

  await PlayerSpellEntity.destroy({
    where: {
      playerTransfermarktId: transfermarktId,
    },
  });
  return true;
};

export const addPlayerSpells = async (
  transfermarktId: number,
  spells: PlayerSpell[]
) => {
  if (spells?.length) {
    await PlayerSpellEntity.bulkCreate(
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

export const createPlayer = async (player: TriviaPlayer) => {
  const { transfermarktId, name, spells } = player;
  const entity = await PlayerEntity.create({
    transfermarktId,
    name,
    lastSpellsUpdate: new Date(),
  });
  await addPlayerSpells(transfermarktId, spells);
  return entity;
};
