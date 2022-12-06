package main

import (
	"log"

	"github.com/bwmarrin/discordgo"
)

type ChutebotDiscord struct {
	*discordgo.Session
	GuildID string
}

type ChutebotInteraction struct {
	*discordgo.Session
	*discordgo.InteractionCreate
}

type ChutebotCommandHandler func(cbotInteraction *ChutebotInteraction)

func CreateChutebotDiscord(discordBotToken string, guildID string) (*ChutebotDiscord, error) {
	log.Println("Creating Discord session...")

	session, err := discordgo.New("Bot " + discordBotToken)
	if err != nil {
		return nil, err
	}

	err = session.Open()
	if err != nil {
		return nil, err
	}

	return &ChutebotDiscord{
		Session: session,
		GuildID: guildID,
	}, nil
}

func (cbotDiscord *ChutebotDiscord) SendMessageToChannel(
	channelID string, content string,
) {
	cbotDiscord.ChannelMessageSend(channelID, content)
}

func (cbotInteraction *ChutebotInteraction) ReplyWithMessage(content string) {
	cbotInteraction.InteractionRespond(
		cbotInteraction.Interaction,
		&discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: content,
			},
		},
	)
}
