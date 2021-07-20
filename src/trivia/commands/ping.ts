import { ChutebotCommand } from "../../core/command-parser";
import { isMessageInBotspam } from "../../core/discord";

export default {
  commandName: "ping",
  permission: (message) => isMessageInBotspam(message),
  handler: async ({ message }) => {
    const pingMessage = await message.channel.send(`Ping...`);
    const latency = pingMessage.createdTimestamp - message.createdTimestamp;
    await pingMessage.edit(`Pong! (${latency}ms)`);
  },
} as ChutebotCommand;
