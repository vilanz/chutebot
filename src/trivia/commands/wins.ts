import { CommandHandler } from "../../core/command-parser";
import { getUserById } from "../../core/discord";
import { getUserWins } from "../db";
import { formatUserWins } from "../format";

export const wins: CommandHandler = async (message) => {
  // TODO clean up this mess
  const userWins = await getUserWins()

  const users = await Promise.all(userWins.map(u => getUserById(u.id)
    .then(discordMember => ({
      discordMember,
      u
    }))))

  const usersWithWins = users.map(u => ({
    userName: u.discordMember.displayName,
    wins: u.u.wins
  }))

  await message.reply(formatUserWins(usersWithWins));
};
