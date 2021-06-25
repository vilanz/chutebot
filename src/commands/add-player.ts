import {
  getPlayerCareerDetailsLink,
  getPlayerCareerFromTransfermarkt,
  Player,
} from "../data";
import { CommandHandler } from "../command-parser";
import { getPlayerSpellsEmbed } from "./start-guessing/format-career";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (message, playerName) => {
  const playerCareerDetailsLink = await getPlayerCareerDetailsLink(playerName);
  if (!playerCareerDetailsLink) {
    await message.channel.send(`O jogador ${playerName} não existe.`);
    return;
  }

  const player = await getPlayerCareerFromTransfermarkt(
    playerCareerDetailsLink
  );

  await message.channel.send(getPlayerSpellsEmbed(player.spells));
};
