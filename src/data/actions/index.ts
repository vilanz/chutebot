import { PlayerEntity, playerExists } from "../db";
import { fetchPlayerCareer } from "../transfermarkt";

export const addPlayerFromTransfermarkt = async (
  transfermarktId: number
): Promise<PlayerEntity | null> => {
  if (await playerExists(transfermarktId)) {
    return null;
  }

  const career = await fetchPlayerCareer(transfermarktId);

  return PlayerEntity.create({
    name: career.playerName,
    transfermarktId,
  });
};
