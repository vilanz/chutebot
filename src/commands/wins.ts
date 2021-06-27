import { CommandHandler } from "../command-parser";
import { getUserWins } from "../data";
import { UserWin } from "../data/types/user";
import { formatUserWins } from "../utils";
import { getUserById } from "../discord-helpers";

export const wins: CommandHandler = async (message) => {
  const userWins: UserWin[] = await getUserWins().then((users) =>
    users.map((u) => ({
      userName: getUserById(u.id, message)!.displayName,
      wins: u.wins,
    }))
  );

  message.reply(formatUserWins(userWins));
};
