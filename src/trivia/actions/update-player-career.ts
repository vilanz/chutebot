import { addPlayerSpells } from "../db";
import { fetchPlayerCareer } from "../transfermarkt";

export const updatePlayerCareer = async (transfermarktId: number) => {
  const career = await fetchPlayerCareer(transfermarktId);
  await addPlayerSpells(transfermarktId, career.spells);
}