import { BOTSPAM_CHANNEL, getUserById, isMessageIn } from "../core/discord";
import { ChutebotCommand } from "../core/command-parser";
import { getUserWins } from "../trivia/db";
import { UserWin } from "../trivia/types";
import { formatUserWins } from "../trivia/format";

const winsCommand: ChutebotCommand = {
  commandName: "wins",
  permission: (message) => isMessageIn(message, BOTSPAM_CHANNEL),
  handler: async (message) => {
    const userWins = await getUserWins();

    const userWinsWithDisplayNames: UserWin[] = await Promise.all(
      userWins.map(async (userWin) => {
        const discordUser = await getUserById(userWin.id);
        return {
          userName: discordUser?.displayName ?? "N/A",
          wins: userWin.wins,
        };
      })
    );

    await message.reply({
      embeds: [formatUserWins(userWinsWithDisplayNames)],
    });
  },
};

export default winsCommand;
