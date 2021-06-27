import { Snowflake } from "discord.js";
import { CommandHandler } from "../command-parser";
import { getUserWins } from "../data";
import { UserWin } from "../data/types/user";
import { formatUserWins } from "../utils";

export const wins: CommandHandler = async (message) => {
  const userWins: UserWin[] = await getUserWins().then((users) =>
    users.map((u) => ({
      userName: message.guild!.members.cache.get(u.id as Snowflake)!
        .displayName,
      wins: u.wins,
    }))
  );

  message.reply(formatUserWins(userWins));
};
