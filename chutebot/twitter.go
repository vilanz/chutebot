package chutebot

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	t "github.com/vilanz/go-twitter/v2"
)

type ChutebotTwitter struct {
	client *t.Client
}

type TwitterAuthorizer struct {
	Token string
}

func (a TwitterAuthorizer) Add(req *http.Request) {
	req.Header.Add("Authorization", "Bearer "+a.Token)
}

func CreateTwitterClient(token string) *ChutebotTwitter {
	client := &t.Client{
		Authorizer: TwitterAuthorizer{
			Token: token,
		},
		Client: http.DefaultClient,
		Host:   "https://api.twitter.com",
	}

	return &ChutebotTwitter{
		client: client,
	}
}

func (cbot *Chutebot) SubscribeToTwitter() {
	tweetStream, err := cbot.twitter.client.TweetSearchStream(
		context.Background(), t.TweetSearchStreamOpts{},
	)
	PanicOnErr("Couldn't start a Twitter stream: %v", err)

	kill := NotifyOnKill()

	go func() {
		for {
			select {
			case <-kill:
				log.Println("Closing Twitter stream...")
				tweetStream.Close()

			case tm := <-tweetStream.Tweets():
				tmb, err := json.Marshal(tm)
				LogOnErr("Error decoding tweet message: %v (message: %v)", err, string(tmb))
				log.Printf("Tweet: %v, cu: %v", string(tmb), tm.Raw)

			case sm := <-tweetStream.SystemMessages():
				smb, err := json.Marshal(sm)
				LogOnErr("Error decoding system message: %v (message: %v)", err, string(smb))
				log.Printf("Received system message: %v", string(smb))

			case strErr := <-tweetStream.Err():
				LogOnErr("Tweet stream error: %v", strErr)

			default:
			}
			if !tweetStream.Connection() {
				log.Println("Connection to Twitter lost")
				return
			}
		}
	}()
}

func (twitter *ChutebotTwitter) AddTwitterRule(query string, channel string) error {
	res, err := twitter.client.TweetSearchStreamAddRule(
		context.Background(),
		[]t.TweetSearchStreamRule{
			{
				Value: query,
				Tag:   fmt.Sprintf("%v-%v", channel, query),
			},
		},
		false,
	)
	twitterErr := getTwitterError(res.Errors)
	if twitterErr != nil {
		return twitterErr
	}
	return err
}

func (twitter *ChutebotTwitter) ListRules() (*t.TweetSearchStreamRulesResponse, error) {
	res, err := twitter.client.TweetSearchStreamRules(
		context.Background(), []t.TweetSearchStreamRuleID{},
	)
	twitterErr := getTwitterError(res.Errors)
	if twitterErr != nil {
		return nil, twitterErr
	}
	return res, err
}

func (twitter *ChutebotTwitter) DeleteRulesByValue(ruleValues []string) error {
	res, err := twitter.client.TweetSearchStreamDeleteRuleByValue(
		context.Background(), ruleValues, false,
	)
	twitterErr := getTwitterError(res.Errors)
	if twitterErr != nil {
		return twitterErr
	}
	return err
}

func getTwitterError(errObj []*t.ErrorObj) error {
	if len(errObj) > 0 {
		errorsJSON, err := json.Marshal(errObj)
		if err != nil {
			return err
		}
		return errors.New(string(errorsJSON))
	}
	return nil
}
