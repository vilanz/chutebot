import { CommandHandler } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { getPlayerByTransfermarktId } from "../db";

export const removePlayer: CommandHandler = async (message, args) => {
  if (!isMessageByOwner(message)) {
    return;
  }

  const id = parseInt(args, 10);
  if (Number.isNaN(id)) {
    return;
  }

  const player = await getPlayerByTransfermarktId(id);
  if (player) {
    const playerName = player?.name || "n/a";
    await player.destroy();
    await message.reply(`${playerName} deletado 👍`);
  }
};
