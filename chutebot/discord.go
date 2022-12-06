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

type CommandHandler func(s *discordgo.Session, i *discordgo.InteractionCreate)

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
		"ping": func(s *discordgo.Session, i *discordgo.InteractionCreate) {
			cbot.discord.RespondInteractionWithMessage(i, "Pong!")
		},
		"feed": func(s *discordgo.Session, i *discordgo.InteractionCreate) {
			option := i.ApplicationCommandData().Options[0]

			switch option.Name {
			case "start":
				cbot.discord.RespondInteractionWithMessage(i, "Iniciando stream de tweets...")

			case "stop":
				cbot.discord.RespondInteractionWithMessage(i, "Parando stream de tweets...")

			case "sub":
				channel := option.Options[0].Value.(string)
				query := option.Options[1].Value.(string)
				log.Printf("Channel: %v", channel)
				err := cbot.twitter.AddTwitterRule(query, channel)
				LogOnErr("Could not add rule: %v", err)
				cbot.discord.RespondInteractionWithMessage(i, "Regra adicionada.")

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
				cbot.discord.RespondInteractionWithMessage(i, "Regras removidas.")

			case "list":
				rules, _ := cbot.twitter.ListRules()
				str, _ := json.Marshal(rules)
				cbot.discord.RespondInteractionWithMessage(i, string(str))
			}
		},
	}

	session := cbot.discord.session
	session.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
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

func (cbotDiscord *ChutebotDiscord) RespondInteractionWithMessage(
	i *discordgo.InteractionCreate, content string,
) {
	cbotDiscord.session.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: content,
		},
	})
}

func (cbotDiscord *ChutebotDiscord) SendMessageToChannel(
	channelID string, content string,
) {
	cbotDiscord.session.ChannelMessageSend(channelID, content)
}
