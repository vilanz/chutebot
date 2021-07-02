module.exports = {
  apps: [
    {
      name: "bot",
      script: "./src/start-pm2.js",
      env: {
        NODE_ENV: "production",
      },
      env_prod: {
        BOT_MODE: "prod",
      },
    },
  ],
};
