import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { getPlayerByTransfermarktId } from "../../core/db";

export default {
  commandName: "remove",
  permission: (message) => isMessageByOwner(message),
  handler: async (message, args) => {
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
  },
} as ChutebotCommand;
