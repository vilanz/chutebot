# chutebot

A Discord bot for football.

## Features

### Player quiz

##### `c!add <player name>`

Gets the player's career record from Transfermarkt and adds it into the pool of available players.

##### `c!start`

Starts a quiz session.

##### `c!g [name]`

During a quiz session, guesses the player's name being `[name]`.

##### `c!wins`

Displays a leaderboard of quiz winners.

### Live goals stream

Whenever a goal from an ongoing match is posted on some Twitter accounts, it will be fetched and posted on the channel as well.

TODO: add commands for handling this, it's manual right now

### General

#### `c!ping`

Returns `Pong!` with the response's latency.

## Getting started

#### `yarn start`

Runs the bot.

#### `yarn test`

Runs tests.
