import { Client, Intents } from "discord.js";

export const discordClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});
