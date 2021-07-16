import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { playerService } from "../data";

export default {
  commandName: "remove",
  permission: (message) => isMessageByOwner(message),
  handler: async (message, args) => {
    const id = parseInt(args, 10);
    if (Number.isNaN(id)) {
      return;
    }

    const player = playerService.getById(id);
    if (!player) {
      await message.reply("Esse jogador não existe.");
      return;
    }

    const deleteResult = playerService.delete(id);
    if (deleteResult.changes > 0) {
      await message.reply(`${player.name} deletado 👍`);
    }
  },
} as ChutebotCommand;
