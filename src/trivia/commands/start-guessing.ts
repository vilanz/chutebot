import { Message } from "discord.js";
import {
  parseCommand,
  Commands,
  ChutebotCommand,
} from "../../core/command-parser";
import { getRandomPlayerId } from "../../core/db";
import { guessPlayerName, formatPlayerSpells } from "../format";
import { getUpdatedPlayer } from "../actions";
import { isMessageInBotspam } from "../../core/discord";
import { userService } from "../data";
import { secondsToMs } from "../../core/utils";

const SECONDS_TO_GUESS = 20;

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

export default {
  commandName: "start",
  permission: (message) => isMessageInBotspam(message),
  handler: async (message) => {
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

      let correctMessage: Message | null = null;

      setTimeout(() => {
        if (!correctMessage) {
          void playerSpellsMessage.reply("5 segundos faltando...");
        }
      }, secondsToMs(SECONDS_TO_GUESS - 5));

      correctMessage = await message.channel
        .awaitMessages(isCorrectPlayer(randomPlayer.name), {
          max: 1,
          time: secondsToMs(SECONDS_TO_GUESS),
          errors: ["time"],
        })
        .then((ms) => ms.first()!)
        .catch(() => null);

      if (correctMessage === null) {
        await playerSpellsMessage.reply(
          `Ninguém acertou depois de ${SECONDS_TO_GUESS} segundos. Era o **${randomPlayer.name}**.`
        );
        return;
      }

      const winner = correctMessage.author;

      userService.upsertUserWin(correctMessage.author.id);

      await correctMessage.reply(
        `${winner} acertou! Era o **${randomPlayer.name}**.`
      );
    } finally {
      channelsWithSessionsRunning.delete(channelId);
    }
  },
} as ChutebotCommand;
