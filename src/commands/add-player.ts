import { getPlayerFromTransfermarkt, Player } from "../data";
import { log } from "../log";
import { CommandHandler, Commands } from "./parser";

// TODO use a real DB
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (command, message) => {
  try {
    const playerName = command.args;
    log(Commands.AddPlayer, `Will try to add ${playerName}.`);

    const player = await getPlayerFromTransfermarkt(playerName);

    MOCK_PLAYER_DB.push(player);

    message.reply(`foi adicionado ${player.name}.`);
    log(Commands.AddPlayer, `Added ${player.name}.`);
  } catch (err) {
    message.reply("não rolou.");
    log(Commands.AddPlayer, "An error ocurred.", err);
  }
};
