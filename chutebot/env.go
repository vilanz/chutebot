package chutebot

import (
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	discordGuildId  string
	discordBotToken string
	twitterToken    string
}

func BuildEnv() *Env {
	err := godotenv.Load(".env")
	PanicOnErr("Failed to load env: %v", err)

	discordBotToken := os.Getenv("DISCORD_BOT_TOKEN")
	discordGuildId := os.Getenv("DISCORD_GUILD_ID")
	twitterToken := os.Getenv("TWITTER_TOKEN")

	return &Env{
		discordGuildId:  discordGuildId,
		discordBotToken: discordBotToken,
		twitterToken:    twitterToken,
	}
}
