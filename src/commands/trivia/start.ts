import { Message, MessageEmbed, ThreadChannel } from "discord.js";
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
  Player,
  PlayerEntity,
  PlayerSpell,
  PlayerSpellEntity,
  UserEntity,
} from "../../db";

// TODO move this to a more specific file
const updatePlayerSpells = async (player: PlayerEntity) => {
  const career = await fetchPlayerCareer(player.transfermarktId);
  career.spells.forEach((sp) => {
    const spell = new PlayerSpellEntity();
    spell.club = sp.club;
    spell.goals = sp.goals;
    spell.matches = sp.matches;
    spell.season = sp.season;
    player.spells.push(spell);
  });
  await player.save();
};

const SECONDS_TO_GUESS = 25;

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

const waitForCorrectGuess = async (
  triviaThread: ThreadChannel,
  player: Player
): Promise<Message | null> => {
  const WHEN_FIVE_SECONDS_REMAIN = secondsToMs(SECONDS_TO_GUESS - 5);
  const countTimeout = setTimeout(() => {
    void triviaThread.send("Faltam 5 segundos!");
  }, WHEN_FIVE_SECONDS_REMAIN);

  return triviaThread
    .awaitMessages({
      filter: (m: Message) => filterByPlayerName(m, player.name),
      max: 1,
      time: secondsToMs(SECONDS_TO_GUESS),
      errors: ["time"],
    })
    .then((ms) => ms.first()!)
    .catch(() => null)
    .finally(() => {
      clearTimeout(countTimeout);
    });
};

export default {
  name: "start",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message, textChannel }) => {
    const randomPlayer = await PlayerEntity.createQueryBuilder("player")
      .leftJoinAndSelect("player.spells", "spells")
      .orderBy("random()")
      .getOneOrFail();

    if (!randomPlayer.spells.length) {
      void message.react("🔎");
      await updatePlayerSpells(randomPlayer);
    }

    const triviaThread = await textChannel.threads.create({
      name: "chutebot-trivia",
      autoArchiveDuration: 60,
    });

    try {
      await triviaThread.send({
        embeds: [getPlayerSpellsEmbed(randomPlayer.spells)],
      });

      const correctMessage = await waitForCorrectGuess(
        triviaThread,
        randomPlayer
      );

      if (correctMessage === null) {
        await triviaThread.send(
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
      await triviaThread.setArchived(true);
    }
  },
} as ChutebotCommand;
