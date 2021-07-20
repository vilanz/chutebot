import { Message, MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import {
  fetchPlayerCareer,
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../transfermarkt";
import { isMessageInBotspam, waitForUserReaction } from "../../core/discord";
import { createPlayer, getPlayerByTransfermarktId } from "../../core/db";

const awaitForPlayerSearchReaction = async (
  playersFound: PlayerSearchResult[],
  message: Message
): Promise<PlayerSearchResult | null> => {
  const MAX_SHOWN_PLAYERS = 5;
  const PLAYER_REACTIONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"].slice(
    0,
    playersFound.length
  );

  const playersFoundMessage = await message.reply({
    embeds: playersFound
      .slice(0, MAX_SHOWN_PLAYERS)
      .map((p, i) =>
        new MessageEmbed()
          .setTitle(`${p.name} ${PLAYER_REACTIONS[i]}`)
          .setURL(p.transfermarktUrl)
          .setThumbnail(p.image)
          .addField("Clube", p.club, true)
          .addField("Idade", p.age, true)
          .addField("País", p.country, true)
          .setColor("RANDOM")
      ),
  });

  const wantedPlayerIndex = await waitForUserReaction(
    message.author.id,
    playersFoundMessage,
    PLAYER_REACTIONS
  );
  if (wantedPlayerIndex === null) {
    await playersFoundMessage.reply(
      "Nenhum jogador foi escolhido dentro de 20 segundos."
    );
    return null;
  }

  const wantedPlayer = playersFound[wantedPlayerIndex] ?? null;

  if (!wantedPlayer) {
    throw new Error(
      `got invalid prompt ${wantedPlayerIndex} when adding a player`
    );
  }

  return wantedPlayer;
};

export default {
  commandName: "add",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message, args }) => {
    const playerNameWithoutSpaces = args?.trim();
    if (!playerNameWithoutSpaces || playerNameWithoutSpaces.length > 80) {
      await message.reply("Precisamos de um nome válido.");
      return;
    }

    const playersFound = await searchPlayersInTransfermarkt(
      playerNameWithoutSpaces
    );

    if (!playersFound.length) {
      await message.reply("Nenhum jogador encontrado.");
      return;
    }

    const wantedPlayer = await awaitForPlayerSearchReaction(
      playersFound,
      message
    );

    if (!wantedPlayer) {
      return;
    }

    const { transfermarktId } = wantedPlayer;

    if (await getPlayerByTransfermarktId(transfermarktId)) {
      await message.reply(
        `O **${wantedPlayer.name}** já foi adicionado antes.`
      );
      return;
    }

    const career = await fetchPlayerCareer(transfermarktId);

    if (!career.spells.length) {
      await message.reply("Esse jogador não tem clubes na carreira. :analise:");
      return;
    }

    const newPlayerEntity = await createPlayer({
      name: career.name,
      transfermarktId,
      spells: career.spells,
    });

    await message.reply(`**${newPlayerEntity.name}** adicionado com sucesso.`);
  },
} as ChutebotCommand;
