import { CommandHandler } from "../../core/command-parser";
import { getUserById } from "../../core/discord";
import { getUserWins } from "../db";
import { formatUserWins } from "../format";
import { UserWin } from "../types";

export const wins: CommandHandler = async (message) => {
  const userWins = await getUserWins();

  const userWinsWithDisplayNames: UserWin[] = await Promise.all(
    userWins.map(async (userWin) => {
      const discordUser = await getUserById(userWin.id).catch(() => null);
      return {
        userName: discordUser?.displayName ?? "N/A",
        wins: userWin.wins,
      };
    })
  );

  await message.reply({
    embeds: [formatUserWins(userWinsWithDisplayNames)],
  });
};
