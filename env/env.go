package env

import (
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	DiscordGuildId  string
	DiscordBotToken string
	TwitterToken    string
}

func BuildEnv() (*Env, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	discordBotToken := os.Getenv("DISCORD_BOT_TOKEN")
	discordGuildId := os.Getenv("DISCORD_GUILD_ID")
	twitterToken := os.Getenv("TWITTER_TOKEN")

	return &Env{
		DiscordGuildId:  discordGuildId,
		DiscordBotToken: discordBotToken,
		TwitterToken:    twitterToken,
	}, nil
}
