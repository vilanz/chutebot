import Discord from 'discord.js';
import { parseCommand } from './parser';
import { CommandHandler } from './types';

const playerGuessFilter = (name: string) => (message: Discord.Message) => {
  const command = parseCommand(message.content);
  if (!command || command.name !== 'g') {
    return false;
  }
  return command.args === name;
};

export const startGuessing: CommandHandler = async (command, message) => {
  message.channel.send('Iniciando quiz...');

  // TODO use a random player from a real database
  const playerName = command.args;

  message.channel.awaitMessages(playerGuessFilter(playerName), { max: 1, time: 10000, errors: ['time'] })
    .then((collected) => {
      message.channel.send(`${collected.first()!.author} acertou! Era o ${playerName}.`);
    })
    .catch(() => {
      message.channel.send('Ninguém acertou depois de 10 segundos :(');
    });
};
