import { logger } from "../../log";
import { getRandomNumberUpTo, waitSeconds } from "../../utils";
import { PlayerEntity, playerExists } from "../db";
import { fetchPlayerCareer } from "../transfermarkt";

export const addPlayerFromTransfermarkt = async (
  transfermarktId: number,
  useRandomDelay?: boolean
): Promise<PlayerEntity | null> => {
  if (await playerExists(transfermarktId)) {
    return null;
  }

  if (useRandomDelay) {
    const randomDelay = getRandomNumberUpTo(20);
    logger.info(
      "delaying adding %s by %s seconds",
      transfermarktId,
      randomDelay
    );
    await waitSeconds(randomDelay);
  }

  const career = await fetchPlayerCareer(transfermarktId);

  return PlayerEntity.create({
    name: career.playerName,
    transfermarktId,
  });
};
