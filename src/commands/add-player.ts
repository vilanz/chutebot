import { Message, MessageReaction, User } from "discord.js";
import {
  getPlayerCareerFromTransfermarkt,
  Player,
  PlayerEntity,
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../data";
import { CommandHandler } from "../command-parser";
import { formatPlayerSpells, log } from "../utils";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

const PLAYER_REACTIONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const MAX_PLAYERS = PLAYER_REACTIONS.length;

const awaitForPlayerSearchReaction = async (
  playersFound: PlayerSearchResult[],
  message: Message
): Promise<PlayerSearchResult | null> => {
  const playerListNessage = await message.channel.send(`
    Jogadores encontrados:\n${playersFound
      .slice(0, MAX_PLAYERS)
      .map((p, i) => `${PLAYER_REACTIONS[i]} ${p.desc}`)
      .join("\n")}
  `);

  try {
    const isCorrectReactionFromUser = (r: MessageReaction, user: User) =>
      PLAYER_REACTIONS.includes(r.emoji.name) && user.id === message.author.id;

    PLAYER_REACTIONS.map((R) => playerListNessage.react(R));

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
  const playersFound = await searchPlayersInTransfermarkt(playerName);

  log("add", { playersFound });

  if (!playersFound.length) {
    message.channel.send("Nenhum jogador encontrado.");
    return;
  }

  const playerWanted = await awaitForPlayerSearchReaction(
    playersFound,
    message
  );

  log("add", { playerWanted });

  const player = await getPlayerCareerFromTransfermarkt(
    playerWanted!.detailsCareerUrl
  );

  const playerEntity = await PlayerEntity.create(player);

  await Promise.all(
    player.spells.map((spell) => playerEntity.createSpell({ ...spell }))
  );

  const allPlayers = await PlayerEntity.findAll({
    include: [PlayerEntity.associations.spells],
  });

  allPlayers.forEach((p) => {
    const msg = `${p.name}\n${formatPlayerSpells(p.spells ?? [])}`;
    message.channel.send(msg);
  });
};
