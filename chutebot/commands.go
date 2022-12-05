package chutebot

import (
	"log"

	disc "github.com/bwmarrin/discordgo"
)

type CommandHandler func(s *disc.Session, i *disc.InteractionCreate)

var commandMap = map[string]*disc.ApplicationCommand{
	"ping": {
		Name:        "ping",
		Description: "Ping!",
	},
	"feed": {
		Name:        "feed",
		Description: "Twitter feed interaction",
		Options: []*disc.ApplicationCommandOption{
			{
				Name:        "start",
				Description: "Start the Twitter feed",
				Type:        disc.ApplicationCommandOptionSubCommand,
			},
			{
				Name:        "stop",
				Description: "Stop the Twitter feed",
				Type:        disc.ApplicationCommandOptionSubCommand,
			},
			{
				Name:        "sub",
				Description: "Sub to a channel",
				Type:        disc.ApplicationCommandOptionSubCommand,
				Options: []*disc.ApplicationCommandOption{
					{
						Type:        disc.ApplicationCommandOptionChannel,
						Name:        "channel",
						Description: "Channel",
						Required:    true,
					}, {
						Type:        disc.ApplicationCommandOptionString,
						Name:        "query",
						Description: "Twitter query",
						Required:    true,
					},
				},
			},
		},
	},
}

var commandHandlers = map[string]CommandHandler{
	"ping": func(s *disc.Session, i *disc.InteractionCreate) {
		s.InteractionRespond(i.Interaction, &disc.InteractionResponse{
			Type: disc.InteractionResponseChannelMessageWithSource,
			Data: &disc.InteractionResponseData{
				Content: "Pong!",
			},
		})
	},
	"feed": func(s *disc.Session, i *disc.InteractionCreate) {
		option := i.ApplicationCommandData().Options[0]

		switch option.Name {
		case "start":
			s.InteractionRespond(i.Interaction, &disc.InteractionResponse{
				Type: disc.InteractionResponseChannelMessageWithSource,
				Data: &disc.InteractionResponseData{
					Content: "Starting...",
				},
			})
		case "stop":
			s.InteractionRespond(i.Interaction, &disc.InteractionResponse{
				Type: disc.InteractionResponseChannelMessageWithSource,
				Data: &disc.InteractionResponseData{
					Content: "Stopping...",
				},
			})

		case "sub":
			channel := option.Options[0]
			query := option.Options[1]
			log.Printf("Channel: %v, Query: %v", channel, query)
		}
	},
}

func (cbot *Chutebot) SetupCommands() {
	cbot.session.AddHandler(func(s *disc.Session, i *disc.InteractionCreate) {
		commandName := i.ApplicationCommandData().Name
		log.Printf("Received command: %v", commandName)
		handler, ok := commandHandlers[commandName]
		if ok {
			handler(s, i)
		}
	})
	for commandName, command := range commandMap {
		_, err := cbot.session.ApplicationCommandCreate(cbot.session.State.User.ID, cbot.guildID, command)
		if err != nil {
			log.Panicf("Cannot create '%v' command: %v", commandName, err)
		}
	}
}
