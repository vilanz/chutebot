package main

import (
	"log"
	"os"
	"os/signal"

	"chutebot/chutebot"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	discordBotToken := os.Getenv("DISCORD_BOT_TOKEN")
	guildID := os.Getenv("DISCORD_GUILD_ID")

	cbot := chutebot.New(discordBotToken, guildID)
	cbot.SetupCommands()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	log.Println("Shutting down...")

}
