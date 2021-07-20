import { Message, MessageEmbed } from "discord.js";
import {
  parseCommand,
  Commands,
  ChutebotCommand,
} from "../../core/command-parser";
import { guessPlayerName, sortBySeason, removeClubLabels } from "../format";
import { isMessageInBotspam } from "../../core/discord";
import { mapLinebreak, secondsToMs } from "../../core/utils";
import { PlayerSpell } from "../types";

const SECONDS_TO_GUESS = 20;

const getPlayerSpellsEmbed = (spells: PlayerSpell[]): MessageEmbed => {
  const sortedSpells = sortBySeason(spells);
  return new MessageEmbed()
    .setTitle("Quem é?")
    .setDescription(`Chute com **c!g** em até ${SECONDS_TO_GUESS} segundos.`)
    .addField(
      "Temp.",
      mapLinebreak(sortedSpells, (x) => x.season),
      true
    )
    .addField(
      "Time",
      mapLinebreak(sortedSpells, (x) => removeClubLabels(x.club)),
      true
    )
    .addField(
      "P (g)",
      mapLinebreak(sortedSpells, (x) => `${x.matches} (${x.goals})`),
      true
    )
    .setColor("AQUA")
    .setTimestamp(Date.now());
};

const filterForCorrectGuess =
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
  run: async ({ message, playerRepo, userRepo }) => {
    const channelId = message.channel.id;

    if (channelsWithSessionsRunning.has(channelId)) {
      await message.reply("Já tem uma sessão rodando.");
      return;
    }
    channelsWithSessionsRunning.add(channelId);

    try {
      const randomPlayer = await playerRepo.getRandom();

      const playerSpellsMessage = await message.reply({
        embeds: [getPlayerSpellsEmbed(randomPlayer.spells)],
      });

      let correctMessage: Message | null = null;

      setTimeout(() => {
        if (!correctMessage) {
          void playerSpellsMessage.reply("5 segundos faltando...");
        }
      }, secondsToMs(SECONDS_TO_GUESS - 5));

      correctMessage = await message.channel
        .awaitMessages(filterForCorrectGuess(randomPlayer.name), {
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
      userRepo.upsertUserWin(correctMessage.author.id);
      await correctMessage.reply(
        `${winner} acertou! Era o **${randomPlayer.name}**.`
      );
    } finally {
      channelsWithSessionsRunning.delete(channelId);
    }
  },
} as ChutebotCommand;
