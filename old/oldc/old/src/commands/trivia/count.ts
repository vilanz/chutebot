import { PlayerEntity } from "../../db";
import { isMessageInBotspam } from "../../discord";
import { ChutebotCommand } from "..";

export default {
  name: "count",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message, serverId }) => {
    const count = await PlayerEntity.count({
      where: {
        serverId,
      },
    });
    await message.reply(`Temos ${count} jogadores!`);
  },
} as ChutebotCommand;
