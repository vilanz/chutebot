import dotenv from "dotenv";

export interface Env {
  DISCORD_PROD_BOT_TOKEN: string;
  DISCORD_STAGING_BOT_TOKEN: string;
  TWITTER_BEARER_TOKEN: string;
  BOT_MODE?: string;
}

// TODO handle invalid envs

dotenv.config({
  path: "./.env",
});

export const env = process.env as unknown as Env;

export const isStaging = env.BOT_MODE !== "prod";

export const botToken = isStaging
  ? env.DISCORD_STAGING_BOT_TOKEN
  : env.DISCORD_PROD_BOT_TOKEN;
