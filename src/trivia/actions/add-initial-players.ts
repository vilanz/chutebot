import { addPlayerFromTransfermarkt } from "./add-player";

const INITIAL_PLAYER_IDS = [
  423839, // Ribamar,
  68290, // Neymar,
  265660, // Yago Pikachu,
  342229, // Mbappé
  169052, // Edenilson
  191614, // Fred
  38253, // Lewandowski
  418560, // Haaland
  96341, // Lukaku
  105521, // Immobile
  148455, // Salah
  240306, // Bruno Fernandes
  132098, // Harry Kane
  225693, // Fabinho
  74605, // Walter
];

export const addInitialTriviaPlayers = async (): Promise<void> => {
  await Promise.all(
    INITIAL_PLAYER_IDS.map((transfermarktId) =>
      addPlayerFromTransfermarkt(transfermarktId, true)
    )
  );
};
