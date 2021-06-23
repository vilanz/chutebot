import {
  getPlayerFromTransfermarkt,
  getPlayerProfileLink,
  Player,
} from "../data";
import { log } from "../log";
import { CommandHandler, Commands } from "../command-parser";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (message, playerName) => {
  try {
    log(Commands.AddPlayer, `Will try to add ${playerName}.`);
    message.react("👍");

    const playerUrl = await getPlayerProfileLink(playerName);
    if (!playerUrl) {
      message.react("🤔");
      return;
    }

    const player = await getPlayerFromTransfermarkt(playerUrl);

    MOCK_PLAYER_DB.push(player);
    message.react("🤙");
    log(Commands.AddPlayer, `Added ${player.name}.`);
  } catch (err) {
    message.react("❌");
    log(Commands.AddPlayer, "An error ocurred.", err);
  }
};
