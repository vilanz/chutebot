import { flag } from "country-emoji";
import Discord, { Message, MessageEmbed, User } from "discord.js";
import { Player, PlayerSeasonClub } from "../data";
import { log } from "../log";
import { MOCK_PLAYER_DB } from "./add-player";
import { parseCommand, CommandHandler, Commands } from "./parser";

const formatClub = (club: PlayerSeasonClub): string =>
  `${flag(club.country)} ${club.name}`;

const getPlayerEmbed = (player: Player): MessageEmbed =>
  new MessageEmbed()
    .addFields(
      player.seasons.map((season) => ({
        name: season.season,
        value: [
          `:point_right: ${formatClub(season.to)}`,
          `:point_left: ${formatClub(season.from)}`,
          `Por ${season.transferFee} em ${season.date.toLocaleDateString()}`,
        ].join("\n"),
      }))
    )
    .setTimestamp();

const isCorrectPlayer = (playerName: string) => (message: Discord.Message) => {
  const command = parseCommand(message.content);
  if (!command || command.name !== Commands.Guess) {
    return false;
  }
  const correct = command.args === playerName;
  if (!correct) {
    message.react("❌");
  }
  return correct;
};

const waitForCorrectPlayer = async (
  playerName: string,
  message: Message
): Promise<User> => {
  const correctMessages = await message.channel.awaitMessages(
    isCorrectPlayer(playerName),
    {
      max: 1,
      time: 10000,
      errors: ["time"],
    }
  );
  // we set max: 1 so it's always one message
  return correctMessages.first()!.author;
};

const channelsWithSessionsRunning = new Set<string>();

export const startGuessing: CommandHandler = async (command, message) => {
  const channelId = message.channel.id;

  if (channelsWithSessionsRunning.has(channelId)) {
    await message.reply("já tem uma sessão rodando.");
    return;
  }

  channelsWithSessionsRunning.add(channelId);

  try {
    await message.channel.send("Iniciando quiz...");

    // TODO use a random player from an actual database
    const randomPlayer =
      MOCK_PLAYER_DB[Math.floor(Math.random() * MOCK_PLAYER_DB.length)];

    if (!randomPlayer) {
      message.channel.send("Não temos jogadores :(");
      return;
    }

    const embed = getPlayerEmbed(randomPlayer);
    message.channel.send(embed);

    try {
      const correctMessageAuthor = await waitForCorrectPlayer(
        randomPlayer.name,
        message
      );
      await message.channel.send(
        `${correctMessageAuthor} acertou! Era o ${randomPlayer.name}.`
      );
    } catch (err) {
      log("guessing", "Error (probably ran out of time)", err);
      await message.channel.send("Ninguém acertou depois de 10 segundos :(");
    }
  } catch (err) {
    log("start-guessing", "Error", err);
  } finally {
    channelsWithSessionsRunning.delete(channelId);
  }
};
