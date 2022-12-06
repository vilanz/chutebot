package discord

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

var commandMap = map[string]*discordgo.ApplicationCommand{
	"ping": {
		Name:        "ping",
		Description: "Ping!",
	},
	"feed": {
		Name:        "feed",
		Description: "Twitter feed interaction",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Name:        "start",
				Description: "Start the Twitter feed",
				Type:        discordgo.ApplicationCommandOptionSubCommand,
			},
			{
				Name:        "stop",
				Description: "Stop the Twitter feed",
				Type:        discordgo.ApplicationCommandOptionSubCommand,
			},
			{
				Name:        "sub",
				Description: "Sub to a channel",
				Type:        discordgo.ApplicationCommandOptionSubCommand,
				Options: []*discordgo.ApplicationCommandOption{
					{
						Type:        discordgo.ApplicationCommandOptionChannel,
						Name:        "channel",
						Description: "Channel",
						Required:    true,
					}, {
						Type:        discordgo.ApplicationCommandOptionString,
						Name:        "query",
						Description: "Twitter query",
						Required:    true,
					},
				},
			},
			{
				Name:        "unsub",
				Description: "Unsub from a channel",
				Type:        discordgo.ApplicationCommandOptionSubCommand,
				Options: []*discordgo.ApplicationCommandOption{
					{
						Type:        discordgo.ApplicationCommandOptionChannel,
						Name:        "channel",
						Description: "Channel",
						Required:    true,
					},
				},
			},
			{
				Name:        "list",
				Description: "List of subscriptions",
				Type:        discordgo.ApplicationCommandOptionSubCommand,
			},
		},
	},
}

func CreateChutebot(discordBotToken string, guildID string) (*ChutebotDiscord, error) {
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
