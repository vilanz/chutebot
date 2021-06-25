import {
  getPlayerCareerDetailsLink,
  getPlayerCareerFromTransfermarkt,
  Player,
  Players,
  PlayerSpells,
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

  const playerEntity = await Players.create(player);

  await Promise.all(
    player.spells.map(async (spell) => {
      await PlayerSpells.create({
        ...spell,
        playerId: playerEntity.id,
      });
    })
  );
  /*

  const allPlayers = await Players.findAll({
    include: [Players.associations.spells],
  });

  allPlayers.forEach((p) => {
    const msg = `${p.name}\n${getPlayerSpellsEmbed(p.spells ?? [])}`;
    message.channel.send(msg);
  });
  
  */
};
