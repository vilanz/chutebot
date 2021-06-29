import { logger } from "../../log";
import { getRandomNumberUpTo, waitSeconds } from "../../utils";
import { createPlayer, getPlayerByTransfermarktId, PlayerEntity } from "../db";
import { fetchPlayerCareer } from "../transfermarkt";

export const addPlayerFromTransfermarkt = async (
  transfermarktId: number,
  useRandomDelay?: boolean
): Promise<PlayerEntity | null> => {
  if (await getPlayerByTransfermarktId(transfermarktId)) {
    return null;
  }

  if (useRandomDelay) {
    // random delay so we don't send a lot of requests to Transfermarkt at once
    const randomDelay = getRandomNumberUpTo(20);
    logger.info(
      "delaying adding %s by %s seconds",
      transfermarktId,
      randomDelay
    );
    await waitSeconds(randomDelay);
  }

  const career = await fetchPlayerCareer(transfermarktId);

  const entity = await createPlayer({
    name: career.name,
    transfermarktId,
    spells: career.spells,
  });

  return entity;
};