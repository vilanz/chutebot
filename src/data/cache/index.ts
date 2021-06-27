import NodeCache from "node-cache";
import { PlayerCareer } from "../types";

const THIRTY_MINUTES = 60 * 30;

// TODO use Redis
const playerCareersCache = new NodeCache({
  stdTTL: THIRTY_MINUTES,
});

export const getCachedPlayerCareer = (transfermarktId: number) =>
  playerCareersCache.get<PlayerCareer>(transfermarktId);

export const setCachedPlayerCareer = (
  transfermarktId: number,
  playerCareer: PlayerCareer
) => playerCareersCache.set<PlayerCareer>(transfermarktId, playerCareer);
