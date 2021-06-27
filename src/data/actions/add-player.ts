import { logger } from "../../log";
import { getRandomNumberUpTo, waitSeconds } from "../../utils";
import { createPlayer, PlayerEntity, playerExists } from "../db";
import { fetchPlayerCareer } from "../transfermarkt";

export const addPlayerFromTransfermarkt = async (
  transfermarktId: number,
  useRandomDelay?: boolean
): Promise<PlayerEntity | null> => {
  if (await playerExists(transfermarktId)) {
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

  // TODO skip career fetching when adding a player (we only need a name)
  const career = await fetchPlayerCareer(transfermarktId);

  return createPlayer({
    name: career.playerName,
    transfermarktId,
  });
};
