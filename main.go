package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	env, err := BuildEnv()
	if err != nil {
		log.Panicf("Couldn't build env: %v\n", err)
	}

	discord, err := CreateChutebotDiscord(env.DiscordBotToken, env.DiscordGuildId)
	if err != nil {
		log.Panicf("Couldn't initialize Discord: %v\n", err)
	}
	twitter := CreateChutebotTwitter(env.TwitterToken)

	twitterStream, err := StartLiveTwitterFeed(twitter, discord)
	if err != nil {
		log.Panicf("Couldn't start Twitter stream: %v\n", err)
	}
	defer twitterStream.Close()

	SetupDiscordCommands(twitter, discord)

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down...")
}
