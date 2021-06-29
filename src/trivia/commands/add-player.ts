import { Message } from "discord.js";
import { CommandHandler } from "../../command-parser";
import { addPlayerFromTransfermarkt } from "../actions";
import {
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../transfermarkt";
import { waitForUserReaction } from "../../discord-helpers";
import { logger } from "../../log";

const awaitForPlayerSearchReaction = async (
  playersFound: PlayerSearchResult[],
  message: Message
): Promise<PlayerSearchResult | null> => {
  const MAX_PLAYERS = 5;
  const PLAYER_REACTIONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"].slice(
    0,
    playersFound.length
  );

  const playerFoundList = playersFound
    .slice(0, MAX_PLAYERS)
    .map((p, i) => `${PLAYER_REACTIONS[i]} ${p.desc}`)
    .join("\n");
  const playersFoundMessage = await message.reply(`
    Jogadores encontrados:\n${playerFoundList}
  `);

  const wantedPlayerIndex = await waitForUserReaction(
    message.author.id,
    playersFoundMessage,
    PLAYER_REACTIONS
  );
  if (wantedPlayerIndex === null) {
    logger.info("time ran out for adding a player");
    playersFoundMessage.react("⌚");
    return null;
  }

  const wantedPlayer = playersFound[wantedPlayerIndex] ?? null;

  if (!wantedPlayer) {
    throw new Error(
      `got invalid prompt ${wantedPlayerIndex} when adding a player`
    );
  }

  return wantedPlayer;
};

export const addPlayer: CommandHandler = async (message, playerName) => {
  const playerNameWithoutSpaces = playerName?.trim();
  if (!playerNameWithoutSpaces || playerNameWithoutSpaces.length > 80) {
    message.reply("Precisamos de um nome válido.");
    return;
  }

  const playersFound = await searchPlayersInTransfermarkt(playerName);

  if (!playersFound.length) {
    message.reply("Nenhum jogador encontrado.");
    return;
  }

  const wantedPlayer = await awaitForPlayerSearchReaction(
    playersFound,
    message
  );

  if (!wantedPlayer) {
    return;
  }

  const newPlayer = await addPlayerFromTransfermarkt(
    wantedPlayer.transfermarktId
  );

  if (!newPlayer) {
    await message.reply("Esse jogador já foi adicionado.");
  } else {
    await message.reply(`**${newPlayer.name}** adicionado com sucesso.`);
  }
};
