package main

import (
	"log"
	"os"
	"os/signal"

	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	guildID := os.Getenv("DISCORD_GUILD_ID")
	discordBotToken := os.Getenv("DISCORD_BOT_TOKEN")

	session, err := discordgo.New("Bot " + discordBotToken)
	if err != nil {
		log.Fatalf("Couldn't initialize discordgo: %v", err)
	}

	err = session.Open()
	if err != nil {
		log.Fatalf("Couldn't open session: %v", err)
	}

	cmd, err := session.ApplicationCommandCreate(session.State.User.ID, guildID, &discordgo.ApplicationCommand{
		Name:        "ping",
		Description: "Ping",
	})
	if err != nil {
		log.Fatalf("Couldn't create command: %v", err)
	}

	session.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		commandName := i.ApplicationCommandData().Name
		if commandName == "ping" {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "pong",
				},
			})
		}
	})

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	log.Println("Shutting down...")

	err = session.ApplicationCommandDelete(session.State.User.ID, guildID, cmd.ID)
	if err != nil {
		log.Panicf("Couldn't delete command: %v", err)
	}
}
