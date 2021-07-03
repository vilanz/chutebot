import { CommandHandler } from "../../core/command-parser";
import { getUserById } from "../../core/discord";
import { getUserWins } from "../db";
import { formatUserWins } from "../format";

export const wins: CommandHandler = async (message) => {
  const userWins = await getUserWins();

  const userWinsWithDisplayNames = await Promise.all(
    userWins.map(async (userWin) => {
      const discordUser = await getUserById(userWin.id);
      return {
        userName: discordUser.displayName,
        wins: userWin.wins,
      };
    })
  );

  await message.reply(formatUserWins(userWinsWithDisplayNames));
};
