import Discord from 'discord.js';
import dotenv from 'dotenv';
import { handlePing, parseCommand } from './commands';

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
    handlePing(command, message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
