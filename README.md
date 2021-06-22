# guess-the-player

This will be a Discord bot that runs a little quiz game where the clues are a football player's career records.

## Todo

[X] Scrap a real football database
[X] Make scrapped players' career records available for trivia
[ ] Handle invalid data from the football database (like missing spells or incomplete names)
[ ] Store this stuff in an actual database
[ ] Store wins
[ ] Run this in a production environment

## Current commands

#### `c!add <player name>`

Gets the player's career record from Transfermarkt and adds it into the pool of available players.

#### `c!start`

Starts a quiz session.

##### `c!g [name]`

During a quiz session, guesses the player's name being `[name]`.

#### `c!ping`

Returns `Pong!` and the response's latency.

## Getting started

Create a `.env` file based on the `.env.example` file and run `yarn`.

#### `yarn dev`

Runs the project locally.

#### `yarn test`

Runs tests.
