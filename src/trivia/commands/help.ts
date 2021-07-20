import { MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { isMessageInBotspam } from "../../core/discord";

export default {
  commandName: "help",
  permission: (message) => isMessageInBotspam(message),
  handler: async ({ message }) => {
    const TRIVIA_EMBED = new MessageEmbed()
      .setTitle("Comandos de trivia")
      .addField(
        "c!start",
        "Inicia uma sessão de trivia que durará 25 segundos."
      )
      .addField(
        "c!g <jogador>",
        "Adivinhar o nome do jogador na sessão de trivia atual."
      )
      .addField("c!wins", "High scores do trivia.")
      .addField("c!add <pesquisa>", "Adicionar jogadores ao bot.")
      .addField("c!count", "Quantidade de jogadores já adicionados.")
      .setColor("GOLD");
    const GENERAL_EMBED = new MessageEmbed()
      .setTitle("Comandos gerais")
      .addField("c!help", "Mostra esse guia.")
      .addField("c!ping", "Latência do bot.")
      .setColor("AQUA");
    const NOTES_EMBED = new MessageEmbed()
      .setTitle("Notas")
      .addField(
        "Erro ao executar comando! :(",
        "O bot reagirá ao comando com ⚠."
      )
      .addField(
        "Postagem de gols do Twitter",
        "Controlados via comandos admin."
      )
      .addField("Código fonte", "https://github.com/vilanz/chutebot")
      .setColor("RED");
    await message.reply({
      embeds: [TRIVIA_EMBED, GENERAL_EMBED, NOTES_EMBED],
    });
  },
} as ChutebotCommand;
