# guess-the-player

This will be a Discord bot that runs a little quiz game where the clues are a football player's career records.

I still need to scrap the WhoScored database, so for now, it just works as any normal quiz bot.

## Commands

#### `g!start [word]`

Starts a quiz game with `[word]`.
This `[word]` parameter is just for testing. When we use real data, it will be dropped.

#### `g!g [name]`

When a game has started, guesses the player's name being `[name]`.

#### `g!ping`

Returns `Pong!` and the response's latency.

## Getting started

Create a `.env` file based on the `.env.example` file and run `npm install`.

#### `npm start`

Runs the project.

#### `npm test`

Runs tests.

## Todo

[ ] Scrap a real football API
[ ] Store this API's data somewhere
[ ] Store wins somewhere