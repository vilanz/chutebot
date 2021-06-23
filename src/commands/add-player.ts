import { getPlayerPlaymakerstatsId, Player } from "../data";
import { log } from "../log";
import { CommandHandler, Commands } from "../command-parser";
import { RecaptchaError } from "../data/extract/utils";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (message, playerName) => {
  log(Commands.AddPlayer, `Will try to add ${playerName}.`);
  message.react("👍");

  try {
    const playerId = await getPlayerPlaymakerstatsId(playerName);
    message.reply(playerId ?? "N/A");
  } catch (ex) {
    if (ex instanceof RecaptchaError) {
      message.reply("Caímos no captcha :/");
    }
  }
  /*
  const playerUrl = await getPlayerProfileLink(playerName);
  if (!playerUrl) {
    message.reply("Jogador não encontrado.");
    return;
  }

  const player = await getPlayerFromTransfermarkt(playerUrl);

  MOCK_PLAYER_DB.push(player);
  message.reply(`${player.name} adicionado!`);
  log(Commands.AddPlayer, `Added ${player.name}.`);
  */
};
