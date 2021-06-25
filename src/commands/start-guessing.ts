import Discord, { Message, User } from "discord.js";
import { formatPlayerSpells, log } from "../utils";
import { parseCommand, CommandHandler, Commands } from "../command-parser";
import { getRandomPlayer } from "../data";

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
  const TWENTY_SECONDS = 20000;

  const correctMessage = await message.channel
    .awaitMessages(isCorrectPlayer(playerName), {
      max: 1,
      time: TWENTY_SECONDS,
      errors: ["time"],
    })
    .then((ms) => ms.first()!);

  return correctMessage.author;
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

    const randomPlayer = await getRandomPlayer();

    if (!randomPlayer?.spells) {
      message.channel.send("Não temos jogadores :(");
      return;
    }

    const embed = formatPlayerSpells(randomPlayer.spells);
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
  } finally {
    channelsWithSessionsRunning.delete(channelId);
  }
};
