import { Message } from "discord.js";
import {
  parseCommand,
  CommandHandler,
  Commands,
} from "../../core/command-parser";
import { addUserWin, getRandomPlayerId } from "../db";
import { guessPlayerName, formatPlayerSpells } from "../format";
import { getUpdatedPlayer } from "../actions";
import { isMessageByOwner, waitForMessage } from "../../core/discord";
import { removePlayer } from "./remove-player";

const SECONDS_TO_GUESS = 25;

const isCorrectPlayer =
  (playerName: string) =>
  (message: Message): boolean => {
    const command = parseCommand(message.content);
    if (!command || command.name !== Commands.Guess) {
      return false;
    }
    const guess = command.args;
    const correct = guessPlayerName(playerName, guess);
    if (!correct) {
      // eslint-disable-next-line no-void
      void message.react("❌");
    }
    return correct;
  };

const channelsWithSessionsRunning = new Set<string>();

export const startGuessing: CommandHandler = async (message) => {
  const channelId = message.channel.id;

  if (channelsWithSessionsRunning.has(channelId)) {
    await message.reply("Já tem uma sessão rodando.");
    return;
  }

  channelsWithSessionsRunning.add(channelId);

  try {
    const randomPlayerId = await getRandomPlayerId();
    if (!randomPlayerId) {
      throw new Error("could not find a random player");
    }

    const randomPlayer = await getUpdatedPlayer(randomPlayerId);

    const playerSpellsMessage = await message.reply({
      embeds: [formatPlayerSpells(randomPlayer.spells)],
    });

    const correctMessage = await waitForMessage(
      message,
      SECONDS_TO_GUESS,
      isCorrectPlayer(randomPlayer.name)
    );

    if (correctMessage === null) {
      await playerSpellsMessage.reply(
        `Ninguém acertou depois de ${SECONDS_TO_GUESS} segundos. Era o **${randomPlayer.name}**.`
      );
      return;
    }

    const winner = correctMessage.author;

    await addUserWin(correctMessage.author.id);

    const winnerMessage = await correctMessage.reply(
      `${winner} acertou! Era o **${randomPlayer.name}**.`
    );

    channelsWithSessionsRunning.delete(channelId);

    // messy fun for removing weird unknown players
    const deletePlayerReply = await waitForMessage(winnerMessage, 60, (m) => {
      if (!isMessageByOwner(m)) {
        return false;
      }
      const replyToId = m.reference?.messageID;
      return replyToId === winnerMessage.id && m.content === "ata";
    });

    if (deletePlayerReply !== null) {
      await removePlayer(deletePlayerReply, randomPlayerId.toString());
    }
  } finally {
    channelsWithSessionsRunning.delete(channelId);
  }
};
