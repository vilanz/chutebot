import { Snowflake } from "discord.js";
import { sequelizeInstance } from "./instance";
import { PlayerEntity, PlayerAttributes, UserEntity } from "./models";

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
