# chutebot

Football bot for Discord written in Node.js and TypesSript.

## Features

### Player trivia

Guess what's the random player from a custom, incrementable database by their career record.

##### `c!add <player name>`

Search up to 5 players from Transfermarkt. Pick one with reactions to add it into the player database.

##### `c!start`

Starts a trivia session, picking a random anonymous player and detailing their career.

##### `c!g [name]`

Guess the player in the current trivia session.

##### `c!wins`

Displays a leaderboard of trivia winners.

##### `c!count`

Displays how many players have been added in total.

### Live goal feed

Configure posting new videos on Twitter accounts to certain channels.

_All these commands are admin only._

#### `c!feed-start | feed-kill`

Start or stop the Twitter stream.

#### `c!feed-sub <channel> <query> | c!feed-unsub <channel>`

Start or stop posting videos matching `<query>` to `<channel>`.

### General commands

#### `c!ping`

Returns `Pong!` with the response's latency.

## Stack

- Node.js, TypeScript, SQLite, TypeORM, AWS Lightsail, AWS S3

## Getting started

#### `yarn start<:prod>`

Builds and runs the bot. Use `start:prod` to run the production bot instead of the staging one.

#### `yarn stop`

Stops the bot.

#### `yarn rebuild<:prod>`

Same as `yarn:start`, but runs `yarn stop` first.

### `yarn typeorm <command>`

Runs TypeORM's CLI commands, such as `yarn typeorm migrations:run`.

#### `yarn logs`

Displays logs from PM2.

#### `yarn test`

Runs tests.
