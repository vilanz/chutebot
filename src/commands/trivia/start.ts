import { Message, MessageEmbed } from "discord.js";
import { parseUserInput, ChutebotCommand } from "../parser";
import {
  arePlayerNamesEqual,
  sortBySeason,
  removeClubLabels,
  mapLinebreak,
  secondsToMs,
} from "../../utils";
import { isMessageInBotspam } from "../../discord";
import { fetchPlayerCareer } from "../../transfermarkt";
import {
  PlayerEntity,
  PlayerSpell,
  PlayerSpellEntity,
  UserEntity,
} from "../../db";

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

const filterByPlayerName = (message: Message, playerName: string): boolean => {
  const userInput = parseUserInput(message.content);
  if (userInput?.name !== "g") {
    return false;
  }
  const guess = userInput.args;
  const correct = arePlayerNamesEqual(playerName, guess);
  if (!correct) {
    // eslint-disable-next-line no-void
    void message.react("❌");
  }
  return correct;
};

const channelsWithSessionsRunning = new Set<string>();

export default {
  name: "start",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message }) => {
    const channelId = message.channel.id;

    if (channelsWithSessionsRunning.has(channelId)) {
      await message.reply("Já tem uma sessão rodando.");
      return;
    }
    channelsWithSessionsRunning.add(channelId);

    try {
      const randomPlayer = await PlayerEntity.createQueryBuilder("player")
        .leftJoinAndSelect("player.spells", "spells")
        .orderBy("random()")
        .getOneOrFail();

      if (!randomPlayer.spells.length) {
        void message.react("🔎");
        const career = await fetchPlayerCareer(randomPlayer.transfermarktId);
        career.spells.forEach((sp) => {
          const spell = new PlayerSpellEntity();
          spell.club = sp.club;
          spell.goals = sp.goals;
          spell.matches = sp.matches;
          spell.season = sp.season;
          randomPlayer.spells.push(spell);
        });
        await randomPlayer.save();
      }

      const playerSpellsMessage = await message.reply({
        embeds: [getPlayerSpellsEmbed(randomPlayer.spells)],
      });

      let correctMessage: Message | null = null;

      const WHEN_FIVE_SECONDS_REMAIN = secondsToMs(SECONDS_TO_GUESS - 5);
      setTimeout(() => {
        if (!correctMessage) {
          void playerSpellsMessage.reply("5 segundos faltando...");
        }
      }, WHEN_FIVE_SECONDS_REMAIN);

      const correctGuessFn = (m: Message) =>
        filterByPlayerName(m, randomPlayer.name);

      correctMessage = await message.channel
        .awaitMessages({
          filter: correctGuessFn,
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
      await UserEntity.createQueryBuilder()
        .insert()
        .values({ id: winner.id, wins: 1 })
        .onConflict("(id) DO UPDATE SET wins = wins + 1")
        .execute();

      await correctMessage.reply(
        `${winner} acertou! Era o **${randomPlayer.name}**.`
      );
    } finally {
      channelsWithSessionsRunning.delete(channelId);
    }
  },
} as ChutebotCommand;
