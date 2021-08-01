import { Snowflake, TextChannel } from "discord.js";
import { getGuild } from "./guilds";

// TODO split this file
export const getChannel = (channelId: Snowflake): TextChannel | null =>
  (getGuild().channels.cache.get(channelId) as TextChannel) ?? null;
