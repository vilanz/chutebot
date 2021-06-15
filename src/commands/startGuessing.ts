import Discord from "discord.js";
import { parseCommand } from "./parser";
import { CommandHandler, Commands } from "./types";

const filterCorrectGuess =
  (playerName: string) => (message: Discord.Message) => {
    const command = parseCommand(message.content);
    if (!command || command.name !== Commands.Guess) {
      return false;
    }
    const isCorrectPlayer = command.args === playerName;
    if (!isCorrectPlayer) {
      message.react("❌");
    }
    return isCorrectPlayer;
  };

const channelsWithSessionsRunning = new Set<string>();

export const startGuessing: CommandHandler = async (command, message) => {
  const channelId = message.channel.id;

  if (channelsWithSessionsRunning.has(channelId)) {
    message.reply("Já tem uma sessão rodando.");
    return;
  }

  channelsWithSessionsRunning.add(channelId);

  message.channel.send("Iniciando quiz...");

  // TODO use a random player from a real database
  const playerName = command.args;

  try {
    const correctMessage = await message.channel.awaitMessages(
      filterCorrectGuess(playerName),
      { max: 1, time: 10000, errors: ["time"] }
    );
    message.channel.send(
      `${correctMessage.first()!.author} acertou! Era o ${playerName}.`
    );
  } catch (ex) {
    message.channel.send("Ninguém acertou depois de 10 segundos :(");
  }

  channelsWithSessionsRunning.delete(channelId);
};
