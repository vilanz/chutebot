import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";

export default {
  name: "remove",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args, playerRepo }) => {
    const id = parseInt(args, 10);
    if (Number.isNaN(id)) {
      return;
    }

    const player = playerRepo.getById(id);
    if (!player) {
      await message.reply("Esse jogador não existe.");
      return;
    }

    const deleteResult = playerRepo.delete(id);
    if (deleteResult.changes > 0) {
      await message.reply(`${player.name} deletado 👍`);
    }
  },
} as ChutebotCommand;
