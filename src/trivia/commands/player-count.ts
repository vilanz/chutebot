import { CommandHandler } from "../../core/command-parser";
import { getPlayerCount } from "../db";

export const playerCount: CommandHandler = async (message) => {
  const count = await getPlayerCount();
  await message.reply(`Temos ${count} jogadores!`);
};
