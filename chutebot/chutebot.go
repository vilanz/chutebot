package chutebot

import (
	"log"

	"github.com/bwmarrin/discordgo"
)

type Chutebot struct {
	session *discordgo.Session
	guildID string
}

func New(discordBotToken string, guildID string) *Chutebot {
	session, err := discordgo.New("Bot " + discordBotToken)
	if err != nil {
		log.Fatalf("Couldn't initialize discordgo: %v", err)
	}

	err = session.Open()
	if err != nil {
		log.Fatalf("Couldn't open session: %v", err)
	}

	return &Chutebot{
		session,
		guildID,
	}
}
