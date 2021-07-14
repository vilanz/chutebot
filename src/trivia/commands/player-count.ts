import { ChutebotCommand } from "../../core/command-parser";
import { isMessageInBotspam } from "../../core/discord";
import { getPlayerCount } from "../db";

export default {
  commandName: "count",
  permission: (message) => isMessageInBotspam(message),
  handler: async (message) => {
    const count = await getPlayerCount();
    await message.reply(`Temos ${count} jogadores!`);
  },
} as ChutebotCommand;
