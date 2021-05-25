import Discord from 'discord.js';
import { CommandHandler } from './types';

const playerGuessFilter = (message: Discord.Message) => message.content.startsWith('g!g') && message.content === 'g!josé';

export const startGuessing: CommandHandler = async (command, message) => {
  message.channel.send('Iniciando quiz...');
  message.channel.awaitMessages(playerGuessFilter, { max: 1, time: 30000, errors: ['time'] })
    .then((collected) => {
      message.channel.send(`${collected.first()!.author} acertou!`);
    })
    .catch(() => {
      message.channel.send('Ninguém acertou depois de 10 segundos :(');
    });
};
