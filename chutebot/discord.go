package chutebot

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
	d "github.com/bwmarrin/discordgo"
)

type ChutebotDiscord struct {
	session *d.Session
	guildID string
}

type CommandHandler func(s *d.Session, i *d.InteractionCreate)

var commandMap = map[string]*d.ApplicationCommand{
	"ping": {
		Name:        "ping",
		Description: "Ping!",
	},
	"feed": {
		Name:        "feed",
		Description: "Twitter feed interaction",
		Options: []*d.ApplicationCommandOption{
			{
				Name:        "start",
				Description: "Start the Twitter feed",
				Type:        d.ApplicationCommandOptionSubCommand,
			},
			{
				Name:        "stop",
				Description: "Stop the Twitter feed",
				Type:        d.ApplicationCommandOptionSubCommand,
			},
			{
				Name:        "sub",
				Description: "Sub to a channel",
				Type:        d.ApplicationCommandOptionSubCommand,
				Options: []*d.ApplicationCommandOption{
					{
						Type:        d.ApplicationCommandOptionChannel,
						Name:        "channel",
						Description: "Channel",
						Required:    true,
					}, {
						Type:        d.ApplicationCommandOptionString,
						Name:        "query",
						Description: "Twitter query",
						Required:    true,
					},
				},
			},
			{
				Name:        "unsub",
				Description: "Unsub from a channel",
				Type:        d.ApplicationCommandOptionSubCommand,
				Options: []*d.ApplicationCommandOption{
					{
						Type:        d.ApplicationCommandOptionChannel,
						Name:        "channel",
						Description: "Channel",
						Required:    true,
					},
				},
			},
			{
				Name:        "list",
				Description: "List of subscriptions",
				Type:        d.ApplicationCommandOptionSubCommand,
			},
		},
	},
}

func CreateDiscordSession(discordBotToken string, guildID string) *ChutebotDiscord {
	session, err := discordgo.New("Bot " + discordBotToken)
	PanicOnErr("Couldn't initialize discordgo: %v", err)

	err = session.Open()
	PanicOnErr("Couldn't open session: %v", err)

	return &ChutebotDiscord{
		session: session,
		guildID: guildID,
	}
}

func (cbot *Chutebot) SetupCommands() {
	var commandHandlers = map[string]CommandHandler{
		"ping": func(s *d.Session, i *d.InteractionCreate) {
			s.InteractionRespond(i.Interaction, &d.InteractionResponse{
				Type: d.InteractionResponseChannelMessageWithSource,
				Data: &d.InteractionResponseData{
					Content: "Pong!",
				},
			})
		},
		"feed": func(s *d.Session, i *d.InteractionCreate) {
			option := i.ApplicationCommandData().Options[0]

			switch option.Name {
			case "start":
				s.InteractionRespond(i.Interaction, &d.InteractionResponse{
					Type: d.InteractionResponseChannelMessageWithSource,
					Data: &d.InteractionResponseData{
						Content: "Starting...",
					},
				})
			case "stop":
				s.InteractionRespond(i.Interaction, &d.InteractionResponse{
					Type: d.InteractionResponseChannelMessageWithSource,
					Data: &d.InteractionResponseData{
						Content: "Stopping...",
					},
				})
			case "sub":
				channel := option.Options[0].Value.(string)
				query := option.Options[1].Value.(string)
				log.Printf("Channel: %v", channel)
				err := cbot.twitter.AddTwitterRule(query, channel)
				LogOnErr("Could not add rule: %v", err)
				s.InteractionRespond(i.Interaction, &d.InteractionResponse{
					Type: d.InteractionResponseChannelMessageWithSource,
					Data: &d.InteractionResponseData{
						Content: "Regra adicionada.",
					},
				})
			case "unsub":
				channel := option.Options[0].Value.(string)
				rules, _ := cbot.twitter.ListRules()
				rulesToDelete := make([]string, 0)
				for _, r := range rules.Rules {
					if strings.Contains(r.Tag, channel) {
						rulesToDelete = append(rulesToDelete, r.Value)
					}
				}
				err := cbot.twitter.DeleteRulesByValue(rulesToDelete)
				LogOnErr("Could not delete rules: %v", err)
				s.InteractionRespond(i.Interaction, &d.InteractionResponse{
					Type: d.InteractionResponseChannelMessageWithSource,
					Data: &d.InteractionResponseData{
						Content: "Regras removidas.",
					},
				})
			case "list":
				rules, _ := cbot.twitter.ListRules()
				str, _ := json.Marshal(rules)
				s.InteractionRespond(i.Interaction, &d.InteractionResponse{
					Type: d.InteractionResponseChannelMessageWithSource,
					Data: &d.InteractionResponseData{
						Content: string(str),
					},
				})
			}
		},
	}

	session := cbot.discord.session
	session.AddHandler(func(s *d.Session, i *d.InteractionCreate) {
		commandName := i.ApplicationCommandData().Name
		log.Printf("Received command: %v", commandName)
		handler, ok := commandHandlers[commandName]
		if ok {
			handler(s, i)
		}
	})
	for commandName, command := range commandMap {
		_, err := session.ApplicationCommandCreate(
			session.State.User.ID, cbot.discord.guildID, command,
		)
		PanicOnErr("Cannot create command: %v (command name: %v)", err, commandName)
	}
}
