package main

import (
	"bytes"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
	"golang.org/x/exp/maps"
)

var commandMap = map[string]*discordgo.ApplicationCommand{
	"ping": {
		Name:        "ping",
		Description: "Ping!",
	},
	"twittersub": {
		Name:        "twittersub",
		Description: "Subscribe channel to a Twitter stream",
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
	"twitterunsub": {
		Name:        "twitterunsub",
		Description: "Unsub Twitter from a channel",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionChannel,
				Name:        "channel",
				Description: "Channel",
				Required:    true,
			},
		},
	},
	"twitterlist": {
		Name:        "twitterlist",
		Description: "List of Twitter subscriptions",
	},
}

func SetupDiscordCommands(
	cbotTwitter *ChutebotTwitter,
	cbotDiscord *ChutebotDiscord,
) error {
	log.Println("Setting up Discord commands...")
	var commandHandlers = map[string]ChutebotCommandHandler{
		"ping": func(cbotInteraction *ChutebotInteraction) {
			cbotInteraction.ReplyWithMessage("Pong!")
		},
		"twittersub": func(cbotInteraction *ChutebotInteraction) {
			channel := cbotInteraction.GetOptionAt(0).Value.(string)
			query := cbotInteraction.GetOptionAt(1).Value.(string)
			log.Printf("Subscribing to channel %v with query: %v\n", channel, query)
			err := cbotTwitter.AddTwitterRule(query, channel)
			if err != nil {
				log.Printf("Could not add rule: %v\n", err)
			} else {
				cbotInteraction.ReplyWithMessage("Regra adicionada.")
			}
		},
		"twitterunsub": func(cbotInteraction *ChutebotInteraction) {
			channel := cbotInteraction.GetOptionAt(0).Value.(string)
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
		},
		"twitterlist": func(cbotInteraction *ChutebotInteraction) {
			res, _ := cbotTwitter.ListRules()
			var b bytes.Buffer
			b.WriteString("Regras:")
			for _, rule := range res.Rules {
				var channel = strings.Split(rule.Tag, "-")[0]
				b.WriteString("\n<#" + channel + "> - " + rule.Value)
			}
			cbotInteraction.ReplyWithMessage(b.String())
		},
	}

	cbotDiscord.AddHandler(
		func(_ *discordgo.Session, i *discordgo.InteractionCreate) {
			commandName := i.ApplicationCommandData().Name
			log.Printf("Received command: %v", commandName)
			handler, ok := commandHandlers[commandName]
			if ok {
				cbotInteraction := &ChutebotInteraction{
					Session:           cbotDiscord.Session,
					InteractionCreate: i,
				}
				handler(cbotInteraction)
			}
		})

	cbotDiscord.RemoveOldCommands()
	cbotDiscord.AddCommands(maps.Values(commandMap))

	log.Println("Discord commands are set!")
	return nil
}
