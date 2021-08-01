import { MessageEmbed, Snowflake, ThreadChannel } from "discord.js";
import { ChutebotCommand } from "..";
import {
  fetchPlayerCareer,
  PlayerSearchResult,
  searchPlayersInTransfermarkt,
} from "../../transfermarkt";
import { isMessageInBotspam, waitForUserReaction } from "../../discord";
import { PlayerEntity, PlayerSpellEntity } from "../../db/entities";

const awaitForPlayerSearchReaction = async (
  playersFound: PlayerSearchResult[],
  playersThread: ThreadChannel,
  authorId: Snowflake
): Promise<PlayerSearchResult | null> => {
  const MAX_SHOWN_PLAYERS = 5;
  const PLAYER_REACTIONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"].slice(
    0,
    playersFound.length
  );

  const playersFoundMessage = await playersThread.send({
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
    authorId,
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
  name: "add",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message, args }) => {
    const playerNameWithoutSpaces = args?.trim();
    if (!playerNameWithoutSpaces || playerNameWithoutSpaces.length > 80) {
      await message.react("❌");
      return;
    }

    const playersThread = await message.startThread({
      name: "add-player",
      autoArchiveDuration: 60,
    });

    try {
      const playersFound = await searchPlayersInTransfermarkt(
        playerNameWithoutSpaces
      );

      if (!playersFound.length) {
        await playersThread.send("Nenhum jogador encontrado.");
        return;
      }

      const wantedPlayer = await awaitForPlayerSearchReaction(
        playersFound,
        playersThread,
        message.author.id
      );
      if (!wantedPlayer) {
        return;
      }

      // TODO use a faster query like EXISTS() (TypeORM has no builtin support for it)
      const existingPlayer = await PlayerEntity.findOne({
        where: {
          transfermarktId: wantedPlayer.transfermarktId,
        },
        select: ["transfermarktId"],
      });

      if (existingPlayer) {
        await playersThread.send(
          `O **${wantedPlayer.name}** já foi adicionado antes.`
        );
        return;
      }

      const newPlayer = await fetchPlayerCareer(wantedPlayer.transfermarktId);

      if (!newPlayer.spells.length) {
        await playersThread.send(
          "Esse jogador não tem clubes na carreira. :analise:"
        );
        return;
      }

      await PlayerEntity.createQueryBuilder()
        .insert()
        .values(newPlayer)
        .execute();

      await PlayerSpellEntity.createQueryBuilder()
        .insert()
        .values(
          newPlayer.spells.map((sp) => ({
            ...sp,
            player: newPlayer,
          }))
        )
        .execute();

      await playersThread.send(`**${newPlayer.name}** adicionado com sucesso.`);
    } finally {
      await playersThread.setArchived(true);
    }
  },
} as ChutebotCommand;
