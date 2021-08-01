import { ChutebotCommand } from "../../core/command-parser";
import { PlayerEntity } from "../../core/db/entities";
import { isMessageByOwner } from "../../core/discord";

export default {
  name: "remove",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args }) => {
    const id = parseInt(args, 10);
    if (Number.isNaN(id)) {
      return;
    }

    const player = await PlayerEntity.findOne(id);
    if (!player) {
      await message.reply("Esse jogador não existe.");
      return;
    }

    await player.remove();
    await message.reply(`${player.name} deletado 👍`);
  },
} as ChutebotCommand;
