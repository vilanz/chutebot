import Discord from 'discord.js';
import dotenv from 'dotenv';
import { ping, parseCommand } from './commands';
import { startGuessing } from './commands/startGuessing';

dotenv.config();

const client = new Discord.Client();

client.on('ready', () => {
  console.log('Started bot.');
});

client.on('message', (message) => {
  const command = parseCommand(message.content);
  if (!command) {
    return;
  }

  if (command.name === 'ping') {
    ping(command, message);
  } else if (command.name === 'start') {
    startGuessing(command, message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
