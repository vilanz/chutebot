import dotenv from "dotenv";

export interface Env {
  DISCORD_BOT_TOKEN: string;
  TWITTER_BEARER_TOKEN: string;
}

// TODO handle invalid envs

// we need to parse it to unknown first
const parsedEnv: unknown = dotenv.config({
  path: "./.env",
}).parsed!;

console.log(parsedEnv);

export const env = parsedEnv as Env;
