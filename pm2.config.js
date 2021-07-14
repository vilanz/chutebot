module.exports = {
  apps: [
    {
      name: "bot",
      script: "./build/bot.js",
      env: {
        NODE_ENV: "production",
      },
      env_prod: {
        BOT_MODE: "prod",
      },
      shutdown_with_message: true,
    },
  ],
};
