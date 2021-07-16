import { ChutebotCommand } from "../../core/command-parser";
import { isMessageInBotspam } from "../../core/discord";
import { playerService } from "../data";

export default {
  commandName: "count",
  permission: (message) => isMessageInBotspam(message),
  handler: async (message) => {
    const count = playerService.count();
    await message.reply(`Temos ${count} jogadores!`);
  },
} as ChutebotCommand;
