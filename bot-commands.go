package main

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/vilanz/chutebot/discord"
	"github.com/vilanz/chutebot/twitter"
)

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

func SetupDiscordCommands(
	cbotTwitter *twitter.ChutebotTwitter,
	cbotDiscord *discord.ChutebotDiscord,
) error {
	log.Println("Setting up Discord commands...")
	var commandHandlers = map[string]discord.ChutebotCommandHandler{
		"ping": func(cbotInteraction *discord.ChutebotInteraction) {
			cbotInteraction.ReplyWithMessage("Pong!")
		},
		"feed": func(cbotInteraction *discord.ChutebotInteraction) {
			option := cbotInteraction.ApplicationCommandData().Options[0]

			switch option.Name {
			case "sub":
				channel := option.Options[0].Value.(string)
				query := option.Options[1].Value.(string)
				log.Printf("Subscribing to channel %v with query: %v\n", channel, query)
				err := cbotTwitter.AddTwitterRule(query, channel)
				if err != nil {
					log.Printf("Could not add rule: %v\n", err)
				} else {
					cbotInteraction.ReplyWithMessage("Regra adicionada.")
				}

			case "unsub":
				channel := option.Options[0].Value.(string)
				log.Printf("Unsubscribing from channel: %v\n", channel)
				rules, _ := cbotTwitter.ListRules()
				rulesToDelete := make([]string, 0)
				for _, r := range rules.Rules {
					if strings.Contains(r.Tag, channel) {
						rulesToDelete = append(rulesToDelete, r.Value)
					}
				}
				err := cbotTwitter.DeleteRulesByValue(rulesToDelete)
				if err != nil {
					log.Printf("Could not delete rules %v: %v\n", rulesToDelete, err)
				} else {
					cbotInteraction.ReplyWithMessage("Regras removidas.")
				}

			case "list":
				rules, _ := cbotTwitter.ListRules()
				str, _ := json.Marshal(rules)
				cbotInteraction.ReplyWithMessage(string(str))
			}
		},
	}

	cbotDiscord.AddHandler(func(_ *discordgo.Session, i *discordgo.InteractionCreate) {
		commandName := i.ApplicationCommandData().Name
		log.Printf("Received command: %v", commandName)
		handler, ok := commandHandlers[commandName]
		if ok {
			cbotInteraction := &discord.ChutebotInteraction{
				Session:           cbotDiscord.Session,
				InteractionCreate: i,
			}
			handler(cbotInteraction)
		}
	})

	for _, command := range commandMap {
		_, err := cbotDiscord.Session.ApplicationCommandCreate(
			cbotDiscord.Session.State.User.ID,
			cbotDiscord.GuildID,
			command,
		)
		if err != nil {
			return err
		}
	}

	log.Println("Discord commands are set!")
	return nil
}
