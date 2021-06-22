import Discord, { Message, User } from "discord.js";
import { parseCommand, CommandHandler, Commands } from "./parser";

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
    await message.reply("Já tem uma sessão rodando.");
    return;
  }

  channelsWithSessionsRunning.add(channelId);

  await message.channel.send("Iniciando quiz...");

  // TODO use a random player from a real database
  const playerName = command.args;

  try {
    const correctMessageAuthor = await waitForCorrectPlayer(
      playerName,
      message
    );
    await message.channel.send(
      `${correctMessageAuthor} acertou! Era o ${playerName}.`
    );
  } catch (ex) {
    await message.channel.send("Ninguém acertou depois de 10 segundos :(");
  }

  channelsWithSessionsRunning.delete(channelId);
};
