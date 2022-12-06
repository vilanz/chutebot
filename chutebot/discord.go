package chutebot

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
)

type ChutebotDiscord struct {
	session *discordgo.Session
	guildID string
}

type ChutebotInteraction struct {
	session           *discordgo.Session
	interactionCreate *discordgo.InteractionCreate
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

func CreateDiscordSession(discordBotToken string, guildID string) *ChutebotDiscord {
	log.Println("Creating Discord session...")

	session, err := discordgo.New("Bot " + discordBotToken)
	PanicOnErr("Couldn't initialize discordgo: %v", err)

	err = session.Open()
	PanicOnErr("Couldn't open Discord session: %v", err)

	return &ChutebotDiscord{
		session: session,
		guildID: guildID,
	}
}

func (cbot *Chutebot) SetupCommands() {
	log.Println("Setting up Discord commands...")
	var commandHandlers = map[string]ChutebotCommandHandler{
		"ping": func(cbotInteraction *ChutebotInteraction) {
			cbotInteraction.ReplyWithMessage("Pong!")
		},
		"feed": func(cbotInteraction *ChutebotInteraction) {
			option := cbotInteraction.interactionCreate.ApplicationCommandData().Options[0]

			switch option.Name {
			case "start":
				cbotInteraction.ReplyWithMessage("Iniciando stream de tweets...")

			case "stop":
				cbotInteraction.ReplyWithMessage("Parando stream de tweets...")

			case "sub":
				channel := option.Options[0].Value.(string)
				query := option.Options[1].Value.(string)
				log.Printf("Channel: %v", channel)
				err := cbot.twitter.AddTwitterRule(query, channel)
				LogOnErr("Could not add rule: %v", err)
				cbotInteraction.ReplyWithMessage("Regra adicionada.")

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
				cbotInteraction.ReplyWithMessage("Regras removidas.")

			case "list":
				rules, _ := cbot.twitter.ListRules()
				str, _ := json.Marshal(rules)
				cbotInteraction.ReplyWithMessage(string(str))
			}
		},
	}

	session := cbot.discord.session

	session.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		commandName := i.ApplicationCommandData().Name
		log.Printf("Received command: %v", commandName)
		handler, ok := commandHandlers[commandName]
		if ok {
			cbotInteraction := &ChutebotInteraction{
				session:           session,
				interactionCreate: i,
			}
			handler(cbotInteraction)
		}
	})

	for commandName, command := range commandMap {
		_, err := session.ApplicationCommandCreate(
			session.State.User.ID, cbot.discord.guildID, command,
		)
		PanicOnErr("Cannot create command: %v (command name: %v)", err, commandName)
	}
}

func (cbotInteraction *ChutebotInteraction) ReplyWithMessage(content string) {
	cbotInteraction.session.InteractionRespond(
		cbotInteraction.interactionCreate.Interaction,
		&discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: content,
			},
		},
	)
}

func (cbotDiscord *ChutebotDiscord) SendMessageToChannel(
	channelID string, content string,
) {
	cbotDiscord.session.ChannelMessageSend(channelID, content)
}
