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

func (cbotDiscord *ChutebotDiscord) GetApplicationID() string {
	return cbotDiscord.Session.State.User.ID
}

func (cbotDiscord *ChutebotDiscord) RemoveOldCommands() (err error) {
	oldCommands, err := cbotDiscord.Session.ApplicationCommands(
		cbotDiscord.GetApplicationID(),
		cbotDiscord.GuildID,
	)
	if err != nil {
		return err
	}
	for _, oldCommand := range oldCommands {
		err := cbotDiscord.Session.ApplicationCommandDelete(
			cbotDiscord.GetApplicationID(),
			cbotDiscord.GuildID,
			oldCommand.ID,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func (cbotDiscord *ChutebotDiscord) AddCommands(commands []*discordgo.ApplicationCommand) (err error) {
	for _, command := range commands {
		_, err := cbotDiscord.Session.ApplicationCommandCreate(
			cbotDiscord.GetApplicationID(),
			cbotDiscord.GuildID,
			command,
		)
		if err != nil {
			return err
		}
		log.Printf("Added command '%s'\n", command.Name)
	}
	return nil
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

func (cbotInteraction *ChutebotInteraction) GetOptionAt(index int) *discordgo.ApplicationCommandInteractionDataOption {
	return cbotInteraction.ApplicationCommandData().Options[index]
}
