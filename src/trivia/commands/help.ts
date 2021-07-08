import { stripIndents } from "common-tags";
import { CommandHandler } from "../../core/command-parser";

const NOTES = stripIndents`
- Caso ocorrer um erro ao executar um comando, o bot reagirá com ⚠ à mensagem que invocou o comando.
- A postagem de gols do Twitter nos canais é controlada via comandos admin.
- Código fonte: https://github.com/vilanz/chutebot
`;

export const help: CommandHandler = async (message) => {
  await message.reply({
    embeds: [{
      title: 'Comandos',
      fields: [{
        name: 'c!start',
        value: 'Inicia uma sessão de trivia que durará 25 segundos.',
        inline: true
      }, {
        name: 'c!g <jogador>',
        value: 'Adivinhar o nome do jogador na sessão de trivia atual.',
        inline: true
      }, {
        name: 'c!add <pesquisa>',
        value: 'Escolher um de até 5 jogadores para serem adicionados ao bot.',
        inline: true
      }, {
        name: 'c!wins',
        value: 'High scores do trivia.',
        inline: true
      }, {
        name: 'c!help',
        value: 'Mostra esse guia.',
        inline: true
      }, {
        name: 'c!ping',
        value: 'Latência do bot.',
        inline: true
      }, {
        name: 'Notas',
        value: NOTES
      }]
    }]
  });
};
