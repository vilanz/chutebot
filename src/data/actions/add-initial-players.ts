import { addPlayerFromTransfermarkt } from "./add-player";

const INITIAL_PLAYER_IDS = [
  423839, // Ribamar,
  68290, // Neymar,
  265660, // Yago Pikachu,
];

export const addInitialPlayersIfNeeded = async (): Promise<void> => {
  await Promise.all(
    INITIAL_PLAYER_IDS.map((transfermarktId) =>
      addPlayerFromTransfermarkt(transfermarktId, true)
    )
  );
};
