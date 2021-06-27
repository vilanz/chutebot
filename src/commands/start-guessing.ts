import Discord, { Message } from "discord.js";
import { formatPlayerSpells, secondsToMs } from "../utils";
import { parseCommand, CommandHandler, Commands } from "../command-parser";
import { getRandomPlayer } from "../data";
import { fetchPlayerCareer } from "../data/transfermarkt";
import { logger } from "../log";

const SECONDS_TO_GUESS = 20;

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
    const randomPlayer = await getRandomPlayer();
    if (!randomPlayer) {
      throw new Error("could not find a random player");
    }

    const randomPlayerCareer = await fetchPlayerCareer(
      randomPlayer!.transfermarktId
    );
    if (!randomPlayerCareer) {
      throw new Error(
        `could not find a career for ${JSON.stringify(randomPlayer)}`
      );
    }

    const playerSpellsString = formatPlayerSpells(randomPlayerCareer.spells);
    const playerSpellsMessage = await message.reply(playerSpellsString);

    try {
      const correctMessage = await waitForCorrectPlayer(
        randomPlayer.name,
        message
      );
      await correctMessage.reply(
        `${correctMessage.author} acertou! Era o **${randomPlayer.name}**.`
      );
    } catch (err) {
      // TODO check if it's a timeout error
      logger.info("no correct player was guessed", err);
      await playerSpellsMessage.reply(
        `Ninguém acertou depois de ${SECONDS_TO_GUESS} segundos.`
      );
    }
  } finally {
    channelsWithSessionsRunning.delete(channelId);
  }
};
