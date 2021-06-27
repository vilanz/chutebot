import { Message } from "discord.js";
import { CommandHandler } from "../command-parser";
import { addPlayerFromTransfermarkt } from "../data/actions";
import {
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../data/transfermarkt";
import { waitForUserReaction } from "../discord-helpers";
import { logger } from "../log";

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

  try {
    const wantedPlayerIndex = await waitForUserReaction(
      playersFoundMessage,
      PLAYER_REACTIONS
    );

    const wantedPlayer = playersFound[wantedPlayerIndex] ?? null;

    if (!wantedPlayer) {
      throw new Error(
        `got invalid prompt ${wantedPlayerIndex} when adding a player`
      );
    }

    return wantedPlayer;
  } catch (err) {
    // TODO check if it was actually a timeout
    logger.info("time ran out for adding a player", { err });
    playersFoundMessage.react("⌚");
    return null;
  }
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
