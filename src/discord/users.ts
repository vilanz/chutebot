import { Collection, GuildMember, Snowflake } from "discord.js";
import { getGuild } from "./guilds";

export const prefetchAllUsers = () => getGuild().members.fetch();

export const getUsersByIds = async (
  ids: string[]
): Promise<Collection<Snowflake, GuildMember>> =>
  getGuild()
    .members.fetch()
    .then(
      (members) =>
        members.filter((u) => ids.includes(u.id)) as Collection<
          Snowflake,
          GuildMember
        >
    );
