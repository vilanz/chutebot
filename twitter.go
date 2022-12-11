package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	t "github.com/vilanz/go-twitter/v2"
)

type ChutebotTwitter struct {
	*t.Client
}

type ChutebotTwitterStream struct {
	*t.TweetStream
}

type TwitterAuthorizer struct {
	Token string
}

func (a TwitterAuthorizer) Add(req *http.Request) {
	req.Header.Add("Authorization", "Bearer "+a.Token)
}

func CreateChutebotTwitter(token string) *ChutebotTwitter {
	client := &t.Client{
		Authorizer: TwitterAuthorizer{
			Token: token,
		},
		Client: http.DefaultClient,
		Host:   "https://api.twitter.com",
	}

	return &ChutebotTwitter{
		client,
	}
}

func (cbotTwitter *ChutebotTwitter) CreateTweetStream() (*ChutebotTwitterStream, error) {
	stream, err := cbotTwitter.Client.TweetSearchStream(context.Background(), t.TweetSearchStreamOpts{})
	if err != nil {
		return nil, err
	}
	return &ChutebotTwitterStream{
		stream,
	}, nil
}

func (cbotTwitter *ChutebotTwitter) AddTwitterRule(query string, channel string) error {
	res, err := cbotTwitter.Client.TweetSearchStreamAddRule(
		context.Background(),
		[]t.TweetSearchStreamRule{
			{
				Value: query,
				Tag:   fmt.Sprintf("%v-%v", channel, query),
			},
		},
		false,
	)
	if res != nil {
		twitterErr := getTwitterError(res.Errors)
		if twitterErr != nil {
			return twitterErr
		}
	}
	return err
}

func (cbotTwitter *ChutebotTwitter) ListRules() (*t.TweetSearchStreamRulesResponse, error) {
	res, err := cbotTwitter.Client.TweetSearchStreamRules(
		context.Background(), []t.TweetSearchStreamRuleID{},
	)
	if res != nil {
		twitterErr := getTwitterError(res.Errors)
		if twitterErr != nil {
			return nil, twitterErr
		}
	}
	return res, err
}

func (cbotTwitter *ChutebotTwitter) DeleteRulesByValue(ruleValues []string) error {
	res, err := cbotTwitter.Client.TweetSearchStreamDeleteRuleByValue(
		context.Background(), ruleValues, false,
	)
	if res != nil {
		twitterErr := getTwitterError(res.Errors)
		if twitterErr != nil {
			return twitterErr
		}
	}
	return err
}

func getTwitterError(errObj []*t.ErrorObj) error {
	if errObj == nil {
		return nil
	}
	if len(errObj) > 0 {
		errorsJSON, err := json.Marshal(errObj)
		if err != nil {
			return err
		}
		return errors.New(string(errorsJSON))
	}
	return nil
}

func ParseChannelInsideRule(rule *t.TweetSearchStreamRule) string {
	channel := strings.Split(rule.Tag, "-")[0]
	return channel
}
