import { ChutebotCommand } from "../../core/command-parser";
import { isMessageInBotspam } from "../../core/discord";

export default {
  commandName: "count",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message, playerRepo }) => {
    const count = playerRepo.count();
    await message.reply(`Temos ${count} jogadores!`);
  },
} as ChutebotCommand;
