import { MessageEmbed } from "discord.js";
import { CommandHandler } from "../../core/command-parser";

export const help: CommandHandler = async (message) => {
  const TRIVIA_EMBED = new MessageEmbed()
    .setTitle("Comandos de trivia")
    .addField("c!start", "Inicia uma sessão de trivia que durará 25 segundos.")
    .addField(
      "c!g <jogador>",
      "Adivinhar o nome do jogador na sessão de trivia atual."
    )
    .addField("c!wins", "High scores do trivia.")
    .addField("c!add <pesquisa>", "Adicionar jogadores ao bot.");
  const GENERAL_EMBED = new MessageEmbed()
    .setTitle("Comandos gerais")
    .addField("c!help", "Mostra esse guia.")
    .addField("c!ping", "Latência do bot.");
  const NOTES_EMBED = new MessageEmbed()
    .setTitle("Notas")
    .addField("Erro ao executar comando! :(", "O bot reagirá ao comando com ⚠.")
    .addField("Postagem de gols do Twitter", "Controlados via comandos admin.")
    .addField("Código fonte", "https://github.com/vilanz/chutebot");
  await message.reply({
    embeds: [TRIVIA_EMBED, GENERAL_EMBED, NOTES_EMBED],
  });
};
