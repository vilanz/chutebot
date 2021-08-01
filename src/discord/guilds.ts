import { Guild } from "discord.js";
import { discordClient } from "./client";
import { GUILD } from "./consts";

export const getGuild = (): Guild => discordClient.guilds.cache.get(GUILD)!;
