import { stripIndents } from 'common-tags'
import { CommandHandler } from "../../core/command-parser";

const HELP_MESSAGE = stripIndents`
**c!start**
Inicia uma sessão de quiz que durará 25 segundos.

**c!g <nome do jogador>**
Adivinhar o nome do jogador no quiz atual.

**c!wins**
High scores do quiz.

**c!add <nome do jogador>**
Busca 5 jogadores no Transfermarkt com esse nome e mostra eles. Quem mandou a mensagem, dentro de 20 segundos, pode reagir pra escolher e adicionar um jogador específico.

**c!ping**
Latência do bot.

> Caso ocorrer um erro em um comando, o bot reagirá com ⚠.

> Gols postados no @goleada_info podem ser imediatamente postados no chat, mas ainda é manual e vai ter de me pingar :bola:
> Ainda serão adicionados comandos para mexer com isso :praydair:

*Código fonte: vilanz/chutebot no GitHub*
`

export const help: CommandHandler = async (message) => {
  // TODO usar Messageembed
  void message.reply(HELP_MESSAGE)
}