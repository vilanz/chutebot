import Discord, { Message } from "discord.js";
import { secondsToMs } from "../../utils";
import { parseCommand, CommandHandler, Commands } from "../../command-parser";
import { logger } from "../../log";
import { addUserWin, getRandomPlayerId } from "../db";
import { guessPlayerName, formatPlayerSpells } from "../format";
import { getUpdatedPlayer } from "../actions/getUpdatedPlayer";

const SECONDS_TO_GUESS = 20;

const isCorrectPlayer = (playerName: string) => (message: Discord.Message) => {
  const command = parseCommand(message.content);
  if (!command || command.name !== Commands.Guess) {
    return false;
  }
  const guess = command.args;
  const correct = guessPlayerName(playerName, guess);
  if (!correct) {
    message.react("❌");
  }
  return correct;
};

const waitForCorrectPlayer = async (
  playerName: string,
  message: Message
): Promise<Message> => {
  const correctMessage = await message.channel
    .awaitMessages(isCorrectPlayer(playerName), {
      max: 1,
      time: secondsToMs(SECONDS_TO_GUESS),
      errors: ["time"],
    })
    .then((ms) => ms.first()!);

  return correctMessage;
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

    const playerSpellsString = formatPlayerSpells(randomPlayer.spells);
    const playerSpellsMessage = await message.reply(playerSpellsString);

    try {
      const correctMessage = await waitForCorrectPlayer(
        randomPlayer.name,
        message
      );
      const winner = correctMessage.author;

      addUserWin(correctMessage.author.id);

      await correctMessage.reply(
        `${winner} acertou! Era o **${randomPlayer.name}**.`
      );
    } catch (err) {
      // TODO check if it's a timeout error
      logger.info("no correct player was guessed", { err });
      await playerSpellsMessage.reply(
        `Ninguém acertou depois de ${SECONDS_TO_GUESS} segundos.`
      );
    }
  } finally {
    channelsWithSessionsRunning.delete(channelId);
  }
};
