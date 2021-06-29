import { CommandHandler } from "../../command-parser";
import { getUserById } from "../../discord-helpers";
import { getUserWins } from "../db";
import { UserWin } from "../types/user";
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
