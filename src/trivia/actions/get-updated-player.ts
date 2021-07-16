import {
  getPlayerByTransfermarktId,
  removeOldPlayerSpells,
} from "../../core/db";
import { Player } from "../types";
import { updatePlayerCareer } from "./update-player-career";

export const getUpdatedPlayer = async (
  transfermarktId: number
): Promise<Player> => {
  // TODO make this less messy
  const hasRemovedOldSpells = await removeOldPlayerSpells(transfermarktId);

  if (hasRemovedOldSpells) {
    await updatePlayerCareer(transfermarktId);
  }

  return getPlayerByTransfermarktId(transfermarktId).then((p) =>
    p!.toInterface()
  );
};
