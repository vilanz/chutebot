package main

import (
	"log"
	"os"
	"os/signal"

	"chutebot/chutebot"
)

func main() {
	cbot := chutebot.Start()
	cbot.SetupCommands()
	cbot.SubscribeToTwitter()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	log.Println("Shutting down...")

}
