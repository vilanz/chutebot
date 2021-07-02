import { CommandHandler } from "../../core/command-parser";
import { getPlayerByTransfermarktId } from "../db";

export const removePlayer: CommandHandler = async (message, args) => {
  const id = parseInt(args, 10);
  if (Number.isNaN(id)) {
    return;
  }
  const player = await getPlayerByTransfermarktId(id);
  if (player) {
    const playerName = player?.name || "n/a";
    await player.destroy();
    void message.reply(`${playerName} deletado 👍`);
  }
};
