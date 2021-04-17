**Original repository** : https://git.fakenews.sh/LaBrosseAdam/ctf-discord-bot

# Discord bot for CTF events organizer

This discord bot allows CTF organizer to quickly create dedicated roles and channels
during a Capture The Flag competition.

## Deployement

From the discord developper portal, create a new application and save the bot token.

The bot can be configured through environment variables.

You can use the [docker.compose.yml]() file to quickly deploy your bot instance using docker.

## Usage

`/assign aperikube @player1 @player2` Assign player(s) to a team. If they don't exist yet,
roles and dedicated channels are created. If the `CREATE_CHANS` isn't enabled, channels will
not be created automatically
`/createChans` Creates all dedicated channels.

## Development

The `npm run watch-debug` command runs typescript compilation and nodemon
