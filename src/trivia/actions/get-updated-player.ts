import {
  getPlayerByTransfermarktId,
  removeOldPlayerSpells,
} from "../../core/db";
import { TriviaPlayer } from "../types";
import { updatePlayerCareer } from "./update-player-career";

export const getUpdatedPlayer = async (
  transfermarktId: number
): Promise<TriviaPlayer> => {
  // TODO make this less messy
  const hasRemovedOldSpells = await removeOldPlayerSpells(transfermarktId);

  if (hasRemovedOldSpells) {
    await updatePlayerCareer(transfermarktId);
  }

  return getPlayerByTransfermarktId(transfermarktId).then((p) =>
    p!.toInterface()
  );
};
