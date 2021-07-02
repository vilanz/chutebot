import dotenv from "dotenv";

export interface Env {
  DISCORD_PROD_BOT_TOKEN: string;
  DISCORD_STAGING_BOT_TOKEN: string;
  TWITTER_BEARER_TOKEN: string;
}

// TODO handle invalid envs

// we need to parse it to unknown first
const parsedEnv: unknown = dotenv.config({
  path: "./.env",
}).parsed!;

export const env = parsedEnv as Env;
