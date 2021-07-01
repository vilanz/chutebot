import { resolve } from "path";
import dotenv from "dotenv";

export interface Env {
  DISCORD_BOT_TOKEN: string;
  TWITTER_BEARER_TOKEN: string;
}

// we need to parse it to unknown first
// TODO handle invalid envs
const getEnv = (): unknown =>
  dotenv.config({
    path: resolve(__dirname, "../.env"),
  }).parsed!;

export const env = getEnv() as Env;
