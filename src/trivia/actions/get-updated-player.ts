import {
  getPlayerByTransfermarktId,
  removeOldPlayerSpells,
  addPlayerSpells,
} from "../db";
import { fetchPlayerCareer } from "../transfermarkt";
import { Player } from "../types";

export const getUpdatedPlayer = async (
  transfermarktId: number
): Promise<Player> => {
  const hasRemovedOldSpells = await removeOldPlayerSpells(transfermarktId);

  if (hasRemovedOldSpells) {
    const career = await fetchPlayerCareer(transfermarktId);
    await addPlayerSpells(transfermarktId, career.spells);
  }

  return getPlayerByTransfermarktId(transfermarktId).then((p) =>
    p!.toInterface()
  );
};
