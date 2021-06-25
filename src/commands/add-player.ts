import {
  getPlayerCareerDetailsLink,
  getPlayerCareerFromTransfermarkt,
  Player,
  PlayerEntity,
} from "../data";
import { CommandHandler } from "../command-parser";
import { getPlayerSpellsEmbed } from "./start-guessing/format-career";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (message, playerName) => {
  const playerCareerDetailsLink = await getPlayerCareerDetailsLink(playerName);
  if (!playerCareerDetailsLink) {
    await message.channel.send(`O jogador ${playerName} não existe.`);
    return;
  }

  const player = await getPlayerCareerFromTransfermarkt(
    playerCareerDetailsLink
  );

  const playerEntity = await PlayerEntity.create(player);

  await Promise.all(
    player.spells.map(async (spell) => {
      await playerEntity.createSpell({ ...spell });
    })
  );

  const allPlayers = await PlayerEntity.findAll({
    include: [PlayerEntity.associations.spells],
  });

  allPlayers.forEach((p) => {
    const msg = `${p.name}\n${getPlayerSpellsEmbed(p.spells ?? [])}`;
    message.channel.send(msg);
  });
};
