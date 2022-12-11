# chutebot

A Twitter bot for Discord written in Go.

> This has been rewritten from a previous TypeScript and the legacy Transfermarkt features will be brought over in the future.

## Development

Add an .env file with the following:

```dotenv
DISCORD_BOT_TOKEN=xxx
DISCORD_GUILD_ID=xxx
TWITTER_TOKEN=xxx
```

## Commands

### /twittersub [#channel] [query]

Subscribes a channel to a Twitter query, posting a stream of tweets matching it in real time.

### /twitterunsub [#channel]

Unsubcribes a channel from all Twitter streams.

### /twitterlist

Lists all Twitter streams associated to channels.

### /ping

Pong! :)
