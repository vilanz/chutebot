import { isMessageInBotspam } from "../../discord";
import { ChutebotCommand } from "..";

export default {
  name: "ping",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message }) => {
    const pingMessage = await message.channel.send(`Ping...`);
    const latency = pingMessage.createdTimestamp - message.createdTimestamp;
    await pingMessage.edit(`Pong! (${latency}ms)`);
  },
} as ChutebotCommand;
