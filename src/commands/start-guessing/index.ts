import Discord, { Message, User } from "discord.js";
import { log } from "../../log";
import { MOCK_PLAYER_DB } from "../add-player";
import { parseCommand, CommandHandler, Commands } from "../../command-parser";
import { getPlayerSeasonsEmbed } from "./format-seasons";

const isCorrectPlayer = (playerName: string) => (message: Discord.Message) => {
  const command = parseCommand(message.content);
  if (!command || command.name !== Commands.Guess) {
    return false;
  }
  const correct = command.args.toLowerCase() === playerName.toLowerCase();
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

export const startGuessing: CommandHandler = async (message) => {
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

    const embed = getPlayerSeasonsEmbed(randomPlayer.seasons);
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
