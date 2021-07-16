# chutebot

Football bot for Discord with a live goal feed and player career trivia.

## Features

### Player trivia

##### `c!add <player name>`

Gets the player's career record from Transfermarkt and adds it into the pool of available players.

##### `c!start`

Starts a trivia session, listing a random anonymous player's career.

##### `c!g [name]`

Guess the player in the current trivia session.

##### `c!wins`

Displays a leaderboard of quiz winners.

##### `c!count`

Displays how many players have been added.

### Live goal feed

#### `c!feed-start | feed-kill | feed-sub <twitter query> | feed-unsub` _(admin-only)_

Whenever a tweet matching a query specified in `c!feed sub` is posted, if it has a video, the video will be posted on the channel where the command was run earlier.

### General

#### `c!ping`

Returns `Pong!` with the response's latency.

## TODO

- Replace Sequelize with a better alternative for TypeScript, like TypeORM
- Send logs to AWS CloudWatch instead of a local file

## Getting started

#### `pm2 start pm2.config.js`

Runs the bot. Use `--env prod` for production.

#### `yarn test`

Runs tests.
