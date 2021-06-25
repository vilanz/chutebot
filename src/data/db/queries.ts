import { Op } from "sequelize";
import { sequelizeInstance } from "./instance";
import { PlayerEntity } from "./models";

export const getRandomPlayer = () =>
  PlayerEntity.findOne({
    order: sequelizeInstance.random(),
    include: [PlayerEntity.associations.spells],
  }).then((p) => p?.toInterface());

export const playerExists = async (
  transfermarktId: number
): Promise<boolean> => {
  const count = await PlayerEntity.count({
    where: {
      transfermarktId: {
        [Op.eq]: transfermarktId,
      },
    },
  });
  return count > 0;
};
