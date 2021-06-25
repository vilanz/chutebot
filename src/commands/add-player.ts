import {
  getPlayerCareerFromTransfermarkt,
  Player,
  PlayerEntity,
  searchPlayersInTransfermarkt,
} from "../data";
import { CommandHandler } from "../command-parser";
import { getPlayerSpellsEmbed } from "./start-guessing/format-career";
import { log } from "../log";

// TODO use a real DB :p
export const MOCK_PLAYER_DB: Player[] = [];

export const addPlayer: CommandHandler = async (message, playerName) => {
  const playersFound = await searchPlayersInTransfermarkt(playerName);

  log("add", { playersFound });

  const waitingForPlayersMessage = await message.channel.send(`
    Jogadores encontrados:
    ${playersFound.map((p) => p.name).join("\n")}
    Responda a essa mensagem com o nome do que você quer em até 15 segundos.
  `);

  try {
    const playerWantedMessage = await message.channel.awaitMessages(
      (m) => playersFound.map((x) => x.name).includes(m.content),
      {
        max: 1,
        time: 15000,
      }
    );
    const playerWanted = playersFound.find(
      (p) => p.name === playerWantedMessage.first()!.content
    );

    log("add", { playerWanted });

    const player = await getPlayerCareerFromTransfermarkt(
      playerWanted!.detailsCareerUrl
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
  } catch {
    waitingForPlayersMessage.react("⌚");
  }
};
