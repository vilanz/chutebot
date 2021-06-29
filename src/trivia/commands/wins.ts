import { CommandHandler } from "../../command-parser";
import { getUserById } from "../../discord";
import { UserWin } from "../types/user";
import { getUserWins } from "../db";
import { formatUserWins } from "../format";

export const wins: CommandHandler = async (message) => {
  const userWins: UserWin[] = await getUserWins().then((users) =>
    users.map((u) => ({
      userName: getUserById(u.id, message)!.displayName,
      wins: u.wins,
    }))
  );

  message.reply(formatUserWins(userWins));
};
