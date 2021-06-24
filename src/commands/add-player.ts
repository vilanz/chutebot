import { Player, scrapPlayerCareerFromTransfermarkt } from "../data";
import { CommandHandler } from "../command-parser";
import { RecaptchaError } from "../data/extract/utils";
import { getPlayerSpellsEmbed } from "./start-guessing/format-career";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (message, url) => {
  try {
    const player = await scrapPlayerCareerFromTransfermarkt(url);
    message.channel.send(getPlayerSpellsEmbed(player.spells));
    // const playerId = await getPlayerPlaymakerstatsId(playerName);
    // message.reply(playerId ?? "N/A");
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
