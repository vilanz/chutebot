// we're extending process.env so we can bypass "no-unused-vars"
// eslint-disable-next-line no-unused-vars
declare namespace NodeJS {
  export interface ProcessEnv {
    DISCORD_BOT_TOKEN: string;
  }
}
