import { addPlayerFromTransfermarkt } from "./actions";
import { hasPlayers } from "./db";

const INITIAL_PLAYER_IDS = [
  423839, // Ribamar,
  68290, // Neymar,
  265660, // Yago Pikachu,
];

const waitSeconds = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms * 1000));

export const addInitialPlayersIfNeeded = async (): Promise<void> => {
  if (await hasPlayers()) {
    return;
  }
  await Promise.all(
    INITIAL_PLAYER_IDS.map(async (transfermarktId) => {
      await addPlayerFromTransfermarkt(transfermarktId);
      await waitSeconds(10);
    })
  );
};
