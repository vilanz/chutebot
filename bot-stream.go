package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/vilanz/chutebot/discord"
	"github.com/vilanz/chutebot/twitter"
	t "github.com/vilanz/go-twitter/v2"
)

func StartLiveTwitterFeed(
	cbotTwitter *twitter.ChutebotTwitter,
	cbotDiscord *discord.ChutebotDiscord,
) (*twitter.ChutebotTwitterStream, error) {
	log.Println("Starting Twitter feed...")

	tweetStream, err := cbotTwitter.CreateTweetStream()
	if err != nil {
		return nil, err
	}

	go func() {
		for {
			defer tweetStream.Close()
			select {
			case tweetMessage := <-tweetStream.Tweets():
				tweet := tweetMessage.Raw.Tweets[0]
				log.Printf("Received tweet: %v\n", tweet)
				for _, rule := range tweetMessage.Raw.MatchingRules {
					cbotDiscord.SendMessageToChannel(
						getDiscordChannelFromRule(rule), getTweetLink(tweet),
					)
				}

			case systemMessage := <-tweetStream.SystemMessages():
				log.Printf("Received system message: %v\n", systemMessage)

			case err := <-tweetStream.Err():
				log.Printf("Tweet stream error: %v\n", err)

			default:
			}
			if !tweetStream.Connection() {
				log.Println("Connection to Twitter lost")
				return
			}
		}
	}()

	log.Println("Twitter feed started!")
	return tweetStream, nil
}

func getTweetLink(tweet *t.TweetObj) string {
	return fmt.Sprintf("https://vxtwitter.com/cuzil/status/%v", tweet.ID)
}

func getDiscordChannelFromRule(rule *t.MatchingRule) string {
	ruleTag := strings.Split(rule.Tag, "-")
	return ruleTag[0]
}
