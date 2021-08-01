import { ChutebotCommand } from "../../core/command-parser";
import { PlayerEntity } from "../../core/db/entities";
import { isMessageInBotspam } from "../../core/discord";

export default {
  name: "count",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message }) => {
    const count = await PlayerEntity.count();
    await message.reply(`Temos ${count} jogadores!`);
  },
} as ChutebotCommand;
