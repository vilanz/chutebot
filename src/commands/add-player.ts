import { Message, MessageReaction, User } from "discord.js";
import {
  getPlayerFromTransfermarkt,
  PlayerEntity,
  playerExists,
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../data";
import { CommandHandler } from "../command-parser";
import { log } from "../utils";

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

  const playerWanted = await awaitForPlayerSearchReaction(
    playersFound,
    message
  );

  log("add", { playerWanted });

  const player = await getPlayerFromTransfermarkt(
    playerWanted!.detailsCareerUrl
  );

  if (await playerExists(player.transfermarktId)) {
    message.reply("Esse jogador já foi adicionado.");
    return;
  }

  const playerEntity = await PlayerEntity.create(player);

  await Promise.all(
    player.spells.map((spell) => playerEntity.createSpell({ ...spell }))
  );

  await message.reply(`**${player.name}** adicionado com sucesso.`);
};
