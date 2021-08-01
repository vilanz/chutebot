import { PlayerEntity } from "../../db";
import { isMessageInBotspam } from "../../discord";
import { ChutebotCommand } from "../parser";

export default {
  name: "count",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message }) => {
    const count = await PlayerEntity.count();
    await message.reply(`Temos ${count} jogadores!`);
  },
} as ChutebotCommand;
