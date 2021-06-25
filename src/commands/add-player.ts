import { Message, MessageReaction, User } from "discord.js";
import { CommandHandler } from "../command-parser";
import { log } from "../utils";
import { addPlayerFromTransfermarkt } from "../data/actions";
import {
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../data/transfermarkt";

const PLAYER_REACTIONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const MAX_PLAYERS = PLAYER_REACTIONS.length;

const awaitForPlayerSearchReaction = async (
  playersFound: PlayerSearchResult[],
  message: Message
): Promise<PlayerSearchResult | null> => {
  const playerListNessage = await message.reply(`
    Jogadores encontrados:\n${playersFound
      .slice(0, MAX_PLAYERS)
      .map((p, i) => `${PLAYER_REACTIONS[i]} ${p.desc}`)
      .join("\n")}
  `);

  try {
    const isCorrectReactionFromUser = (r: MessageReaction, user: User) =>
      !!r.emoji.name &&
      PLAYER_REACTIONS.includes(r.emoji.name) &&
      user.id === message.author.id;

    PLAYER_REACTIONS.slice(0, playersFound.length).map((R) =>
      playerListNessage.react(R)
    );

    const playerWantedReaction = await playerListNessage
      .awaitReactions(isCorrectReactionFromUser, {
        max: 1,
        time: 15000,
      })
      .then((r) => r.first()!);

    const playerWantedIndex = PLAYER_REACTIONS.findIndex(
      (r) => r === playerWantedReaction.emoji.name
    );

    return playersFound[playerWantedIndex] ?? null;
  } catch {
    playerListNessage.react("⌚");
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

  log("add", { playersFound });

  if (!playersFound.length) {
    message.reply("Nenhum jogador encontrado.");
    return;
  }

  const wantedPlayer = await awaitForPlayerSearchReaction(
    playersFound,
    message
  );

  log("add", { playerWanted: wantedPlayer });

  if (!wantedPlayer) {
    message.reply(
      "Não conseguimos pegar o link dos detalhes da carreira do jogador. Isso não deveria estar acontecendo."
    );
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
