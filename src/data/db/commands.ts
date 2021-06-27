import { sequelizeInstance } from "./instance";
import { PlayerEntity } from "./models";
import { PlayerAttributes } from "./models/player";

export const getRandomPlayer = () =>
  PlayerEntity.findOne({
    order: sequelizeInstance.random(),
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

export const createPlayer = (attribs: PlayerAttributes) =>
  PlayerEntity.create(attribs);
