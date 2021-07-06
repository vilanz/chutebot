import { CommandHandler } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { searchPlayersByName } from "../db";

export const listPlayerIds: CommandHandler = async (message, args) => {
  if (!isMessageByOwner(message)) {
    return;
  }

  const playerName = args.trim();
  if (!playerName) {
    return;
  }

  const players = await searchPlayersByName(playerName);
  const formattedPlayers = players
    .map(
      (p) =>
        `${p.transfermarktId}: ${p.name}, ${p.spells?.length ?? "N/A"} clubes`
    )
    .join("\n");

  await message.reply(formattedPlayers ?? "Ninguém encontrado.");
};
